import { useState } from 'react';
import SearchBox from './components/SearchBox';
import './App.css';

function App() {
  const [searchResult, setSearchResult] = useState<string>('');
  const [hasSearched, setHasSearched] = useState(false);

  const handleSearch = (keyword: string) => {
    setHasSearched(true);
    setSearchResult(`搜索关键词: "${keyword}"`);
    
    // 这里可以调用后端 API
    console.log(`搜索: ${keyword}`);
  };

  return (
    <div className="app-container">
      <h1>Redorient 搜索</h1>
      <SearchBox onSearch={handleSearch} />
      
      {hasSearched && (
        <div className="search-results">
          <div className="result-item">
            {searchResult}
          </div>
          <div className="result-item">
            这里将显示搜索结果...
          </div>
          <div className="result-item">
            功能开发中，敬请期待！
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
