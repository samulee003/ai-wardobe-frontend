import axios from 'axios';

class UpdateChecker {
  constructor() {
    this.currentVersion = process.env.REACT_APP_VERSION || '1.0.0';
    // 將預設倉庫改為實際前端倉庫，避免 404
    this.githubRepo = process.env.REACT_APP_GITHUB_REPO || 'samulee003/ai-wardobe-frontend';
    this.apiUrl = `https://api.github.com/repos/${this.githubRepo}/releases/latest`;
    this.checkInterval = 24 * 60 * 60 * 1000; // 24小時
    this.lastCheckKey = 'lastUpdateCheck';
    this.updateDisabledKey = 'updateCheckDisabled';
  }

  log(message) {
    console.log(`[Update Checker] ${message}`);
  }

  isUpdateCheckDisabled() {
    return localStorage.getItem(this.updateDisabledKey) === 'true';
  }

  disableUpdateCheck() {
    localStorage.setItem(this.updateDisabledKey, 'true');
    this.log('更新檢查已禁用');
  }

  enableUpdateCheck() {
    localStorage.removeItem(this.updateDisabledKey);
    this.log('更新檢查已啟用');
  }

  shouldCheckForUpdates() {
    if (this.isUpdateCheckDisabled()) {
      return false;
    }

    const lastCheck = localStorage.getItem(this.lastCheckKey);
    if (!lastCheck) {
      return true;
    }

    const timeSinceLastCheck = Date.now() - parseInt(lastCheck);
    return timeSinceLastCheck > this.checkInterval;
  }

  parseVersion(version) {
    // 移除 'v' 前綴並解析版本號
    const cleanVersion = version.replace(/^v/, '');
    const parts = cleanVersion.split('.').map(num => parseInt(num) || 0);
    
    return {
      major: parts[0] || 0,
      minor: parts[1] || 0,
      patch: parts[2] || 0,
      original: version
    };
  }

  compareVersions(current, latest) {
    const currentParsed = this.parseVersion(current);
    const latestParsed = this.parseVersion(latest);

    if (latestParsed.major > currentParsed.major) return 1;
    if (latestParsed.major < currentParsed.major) return -1;
    
    if (latestParsed.minor > currentParsed.minor) return 1;
    if (latestParsed.minor < currentParsed.minor) return -1;
    
    if (latestParsed.patch > currentParsed.patch) return 1;
    if (latestParsed.patch < currentParsed.patch) return -1;
    
    return 0;
  }

  async fetchLatestRelease() {
    try {
      this.log('檢查最新版本...');
      
      const response = await axios.get(this.apiUrl, {
        timeout: 10000,
        headers: {
          'Accept': 'application/vnd.github.v3+json'
        }
      });

      const release = response.data;
      
      // 查找 APK 文件
      const apkAsset = release.assets.find(asset => 
        asset.name.endsWith('.apk') && 
        (asset.name.includes('release') || asset.name.includes('signed'))
      );

      return {
        tagName: release.tag_name,
        name: release.name,
        body: release.body,
        publishedAt: release.published_at,
        downloadUrl: apkAsset ? apkAsset.browser_download_url : null,
        apkSize: apkAsset ? apkAsset.size : null,
        prerelease: release.prerelease
      };

    } catch (error) {
      this.log(`獲取最新版本失敗: ${error.message}`);
      throw error;
    }
  }

  async checkForUpdates() {
    try {
      if (!this.shouldCheckForUpdates()) {
        this.log('跳過更新檢查');
        return null;
      }

      const latestRelease = await this.fetchLatestRelease();
      localStorage.setItem(this.lastCheckKey, Date.now().toString());

      const comparison = this.compareVersions(this.currentVersion, latestRelease.tagName);
      
      if (comparison > 0) {
        this.log(`發現新版本: ${latestRelease.tagName}`);
        
        return {
          hasUpdate: true,
          currentVersion: this.currentVersion,
          latestVersion: latestRelease.tagName,
          releaseName: latestRelease.name,
          releaseNotes: latestRelease.body,
          downloadUrl: latestRelease.downloadUrl,
          publishedAt: latestRelease.publishedAt,
          apkSize: latestRelease.apkSize,
          isPrerelease: latestRelease.prerelease
        };
      } else {
        this.log('已是最新版本');
        return {
          hasUpdate: false,
          currentVersion: this.currentVersion,
          latestVersion: latestRelease.tagName
        };
      }

    } catch (error) {
      this.log(`更新檢查失敗: ${error.message}`);
      return {
        hasUpdate: false,
        error: error.message
      };
    }
  }

  formatReleaseNotes(notes) {
    if (!notes) return '';
    
    // 簡化 markdown 格式
    return notes
      .replace(/#{1,6}\s/g, '') // 移除標題標記
      .replace(/\*\*(.*?)\*\*/g, '$1') // 移除粗體標記
      .replace(/\*(.*?)\*/g, '$1') // 移除斜體標記
      .replace(/`(.*?)`/g, '$1') // 移除代碼標記
      .split('\n')
      .slice(0, 10) // 只取前10行
      .join('\n');
  }

  formatFileSize(bytes) {
    if (!bytes) return '未知';
    
    const mb = bytes / (1024 * 1024);
    return `${mb.toFixed(1)} MB`;
  }

  openDownloadPage(downloadUrl) {
    if (downloadUrl) {
      window.open(downloadUrl, '_blank');
    } else {
      // 如果沒有直接下載鏈接，打開 releases 頁面
      const releasesUrl = `https://github.com/${this.githubRepo}/releases`;
      window.open(releasesUrl, '_blank');
    }
  }
}

export default UpdateChecker;