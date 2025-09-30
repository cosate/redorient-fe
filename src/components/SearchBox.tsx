import { useState } from 'react';

interface SearchBoxProps {
  onSearch: (keyword: string) => void;
}

const SearchBox = ({ onSearch }: SearchBoxProps) => {
  const [keyword, setKeyword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string>('');

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setKeyword(e.target.value);
    // 清除之前的错误
    if (error) setError('');
  };

  const handleSearch = async () => {
    const trimmedKeyword = keyword.trim();
    
    if (!trimmedKeyword) {
      setError('请输入搜索关键词');
      return;
    }

    if (trimmedKeyword.length > 100) {
      setError('搜索关键词过长，请限制在100字符以内');
      return;
    }

    try {
      setIsLoading(true);
      setError('');
      
      // 模拟搜索延迟
      await new Promise(resolve => setTimeout(resolve, 500));
      
      onSearch(trimmedKeyword);
    } catch (err) {
      setError('搜索时发生错误，请重试');
      console.error('搜索错误:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !isLoading) {
      handleSearch();
    }
  };

  return (
    <div className="search-box">
      <input
        type="text"
        value={keyword}
        onChange={handleInputChange}
        onKeyDown={handleKeyDown}
        placeholder="请输入关键词搜索..."
        disabled={isLoading}
        maxLength={100}
        style={{
          borderColor: error ? '#e74c3c' : undefined
        }}
      />
      <button 
        onClick={handleSearch} 
        disabled={isLoading || !keyword.trim()}
      >
        {isLoading ? '搜索中...' : '搜索'}
      </button>
      {error && (
        <div style={{
          position: 'absolute',
          top: '100%',
          left: '0',
          right: '0',
          color: '#e74c3c',
          fontSize: '14px',
          marginTop: '4px',
          padding: '4px 8px',
          background: '#fff',
          border: '1px solid #e74c3c',
          borderRadius: '4px',
          zIndex: 10
        }}>
          {error}
        </div>
      )}
    </div>
  );
};

export default SearchBox;
