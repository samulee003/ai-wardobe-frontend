import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import ClothingCard from '../../components/ClothingCard';

// Mock LazyImage component
jest.mock('../../components/LazyImage', () => {
  return function MockLazyImage({ src, alt, onError }) {
    return (
      <img 
        src={src} 
        alt={alt} 
        onError={onError}
        data-testid="clothing-image"
      />
    );
  };
});

describe('ClothingCard Component', () => {
  const mockClothing = {
    _id: '123',
    category: '上衣',
    subCategory: 'T恤',
    colors: ['藍色', '白色'],
    style: '休閒',
    season: ['夏'],
    wearCount: 5,
    lastWorn: '2024-01-15T10:00:00.000Z',
    imageUrl: '/uploads/test-image.jpg'
  };

  const mockHandlers = {
    onWear: jest.fn(),
    onEdit: jest.fn(),
    onDelete: jest.fn()
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('renders clothing information correctly', () => {
    render(<ClothingCard clothing={mockClothing} {...mockHandlers} />);

    expect(screen.getByText('上衣')).toBeInTheDocument();
    expect(screen.getByText('T恤')).toBeInTheDocument();
    expect(screen.getByText('休閒')).toBeInTheDocument();
    expect(screen.getByText('夏')).toBeInTheDocument();
    expect(screen.getByText('穿過 5 次')).toBeInTheDocument();
  });

  test('displays clothing image with correct src', () => {
    render(<ClothingCard clothing={mockClothing} {...mockHandlers} />);

    const image = screen.getByTestId('clothing-image');
    expect(image).toHaveAttribute('src', 'http://localhost:5000/uploads/test-image.jpg');
    expect(image).toHaveAttribute('alt', 'T恤');
  });

  test('displays color dots for each color', () => {
    render(<ClothingCard clothing={mockClothing} {...mockHandlers} />);

    // Should have 2 color dots for 藍色 and 白色
    const colorDots = screen.getAllByTitle(/藍色|白色/);
    expect(colorDots).toHaveLength(2);
  });

  test('calls onWear when wear button is clicked', async () => {
    render(<ClothingCard clothing={mockClothing} {...mockHandlers} />);

    const wearButton = screen.getByText('記錄穿著');
    fireEvent.click(wearButton);

    expect(mockHandlers.onWear).toHaveBeenCalledWith('123');
  });

  test('calls onEdit when edit button is clicked', () => {
    render(<ClothingCard clothing={mockClothing} {...mockHandlers} />);

    const editButton = screen.getByText('編輯');
    fireEvent.click(editButton);

    expect(mockHandlers.onEdit).toHaveBeenCalledWith(mockClothing);
  });

  test('shows confirmation dialog and calls onDelete when delete button is clicked', () => {
    // Mock window.confirm
    const originalConfirm = window.confirm;
    window.confirm = jest.fn(() => true);

    render(<ClothingCard clothing={mockClothing} {...mockHandlers} />);

    const deleteButton = screen.getByText('刪除');
    fireEvent.click(deleteButton);

    expect(window.confirm).toHaveBeenCalledWith('確定要刪除這件衣物嗎？');
    expect(mockHandlers.onDelete).toHaveBeenCalledWith('123');

    // Restore original confirm
    window.confirm = originalConfirm;
  });

  test('does not call onDelete when confirmation is cancelled', () => {
    // Mock window.confirm to return false
    const originalConfirm = window.confirm;
    window.confirm = jest.fn(() => false);

    render(<ClothingCard clothing={mockClothing} {...mockHandlers} />);

    const deleteButton = screen.getByText('刪除');
    fireEvent.click(deleteButton);

    expect(window.confirm).toHaveBeenCalled();
    expect(mockHandlers.onDelete).not.toHaveBeenCalled();

    // Restore original confirm
    window.confirm = originalConfirm;
  });

  test('displays last worn date correctly', () => {
    render(<ClothingCard clothing={mockClothing} {...mockHandlers} />);

    expect(screen.getByText(/上次:/)).toBeInTheDocument();
  });

  test('displays "未穿過" when lastWorn is null', () => {
    const clothingNeverWorn = {
      ...mockClothing,
      lastWorn: null
    };

    render(<ClothingCard clothing={clothingNeverWorn} {...mockHandlers} />);

    expect(screen.getByText('未穿過')).toBeInTheDocument();
  });

  test('handles missing optional props gracefully', () => {
    const minimalClothing = {
      _id: '123',
      category: '上衣',
      subCategory: 'T恤',
      colors: ['藍色'],
      imageUrl: '/uploads/test.jpg'
    };

    expect(() => {
      render(<ClothingCard clothing={minimalClothing} />);
    }).not.toThrow();
  });

  test('applies hover effects correctly', () => {
    render(<ClothingCard clothing={mockClothing} {...mockHandlers} />);

    const card = screen.getByText('T恤').closest('div').closest('div');
    
    // Test that the card has the correct styling
    expect(card).toHaveStyle('transition: transform 0.2s ease, box-shadow 0.2s ease');
  });

  test('displays season tags correctly', () => {
    const multiSeasonClothing = {
      ...mockClothing,
      season: ['春', '夏', '秋']
    };

    render(<ClothingCard clothing={multiSeasonClothing} {...mockHandlers} />);

    expect(screen.getByText('春')).toBeInTheDocument();
    expect(screen.getByText('夏')).toBeInTheDocument();
    expect(screen.getByText('秋')).toBeInTheDocument();
  });
});