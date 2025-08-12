import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import styled from 'styled-components';
import { useAuth } from '../contexts/AuthContext';

const Container = styled.div`
  max-width: 400px;
  margin: 50px auto;
  padding: 30px;
  background: white;
  border-radius: 12px;
  box-shadow: 0 4px 16px rgba(0,0,0,0.1);
`;

const Title = styled.h1`
  text-align: center;
  color: #333;
  margin-bottom: 30px;
  font-size: 28px;
`;

const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: 20px;
`;

const FormGroup = styled.div`
  display: flex;
  flex-direction: column;
`;

const Label = styled.label`
  font-weight: 600;
  color: #333;
  margin-bottom: 5px;
`;

const Input = styled.input`
  padding: 12px;
  border: 2px solid #ddd;
  border-radius: 8px;
  font-size: 16px;
  transition: border-color 0.2s ease;
  
  &:focus {
    outline: none;
    border-color: #007bff;
  }
  
  &:invalid {
    border-color: #dc3545;
  }
`;

const Button = styled.button`
  padding: 12px;
  background: #007bff;
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: background-color 0.2s ease;
  
  &:hover {
    background: #0056b3;
  }
  
  &:disabled {
    background: #ccc;
    cursor: not-allowed;
  }
`;

const TabContainer = styled.div`
  display: flex;
  margin-bottom: 20px;
  border-radius: 8px;
  overflow: hidden;
  border: 2px solid #ddd;
`;

const Tab = styled.button`
  flex: 1;
  padding: 12px;
  border: none;
  background: ${props => props.active ? '#007bff' : '#f8f9fa'};
  color: ${props => props.active ? 'white' : '#666'};
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  
  &:hover {
    background: ${props => props.active ? '#0056b3' : '#e9ecef'};
  }
`;

// 已移除 ADHD 勾選相關樣式元件

const LinkText = styled.p`
  text-align: center;
  margin-top: 20px;
  color: #666;
  
  a {
    color: #007bff;
    text-decoration: none;
    
    &:hover {
      text-decoration: underline;
    }
  }
`;

const Login = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    name: '',
    age: ''
  });

  // 無認證模式：不需要從 AuthContext 取任何函數
  useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      // 無認證模式：直接進入首頁
      navigate('/');
    } catch (error) {
      console.error('認證錯誤:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container>
      <Title>🧥 智能衣櫃</Title>
      
      <TabContainer>
        <Tab 
          type="button"
          active={isLogin} 
          onClick={() => setIsLogin(true)}
        >
          登錄
        </Tab>
        <Tab 
          type="button"
          active={!isLogin} 
          onClick={() => setIsLogin(false)}
        >
          註冊
        </Tab>
      </TabContainer>

      <Form onSubmit={handleSubmit}>
        <FormGroup>
          <Label>電子郵件</Label>
          <Input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            required
            placeholder="請輸入電子郵件"
          />
        </FormGroup>

        <FormGroup>
          <Label>密碼</Label>
          <Input
            type="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            required
            placeholder="請輸入密碼"
            minLength="6"
          />
        </FormGroup>

        {!isLogin && (
          <>
            <FormGroup>
              <Label>姓名</Label>
              <Input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
                placeholder="請輸入姓名"
              />
            </FormGroup>

            <FormGroup>
              <Label>年齡 (可選)</Label>
              <Input
                type="number"
                name="age"
                value={formData.age}
                onChange={handleChange}
                placeholder="請輸入年齡"
                min="1"
                max="120"
              />
            </FormGroup>

            {/* 已移除 ADHD/簡化界面選項 */}
          </>
        )}

        <Button type="submit" disabled={loading}>
          {loading ? '處理中...' : '進入應用'}
        </Button>
      </Form>

      <LinkText>
        {isLogin ? (
          <>還沒有帳號？ <Link to="#" onClick={() => setIsLogin(false)}>立即註冊</Link></>
        ) : (
          <>已有帳號？ <Link to="#" onClick={() => setIsLogin(true)}>立即登錄</Link></>
        )}
      </LinkText>
    </Container>
  );
};

export default Login;