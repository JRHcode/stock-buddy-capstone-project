import { NextRequest, NextResponse } from 'next/server';

interface YahooNewsItem {
  uuid: string;
  title: string;
  publisher: string;
  link: string;
  providerPublishTime: number;
  type: string;
  thumbnail?: {
    resolutions: Array<{
      url: string;
      width: number;
      height: number;
      tag: string;
    }>;
  };
  relatedTickers?: string[];
}

interface YahooNewsResponse {
  items: {
    result: YahooNewsItem[];
  };
}

// Fetch general financial news from Yahoo Finance
const fetchYahooFinanceNews = async (): Promise<YahooNewsItem[]> => {
  try {
    // Yahoo Finance news endpoint for general financial news
    const url = 'https://query1.finance.yahoo.com/v1/finance/search?q=finance&lang=en-US&region=US&quotesCount=0&newsCount=20&listsCount=0&enableFuzzyQuery=false&quotesQueryId=tss_match_phrase_query&multiQuoteQueryId=multi_quote_single_token_query&newsQueryId=news_cie_vespa&enableCb=true&enableNavLinks=true&enableEnhancedTrivialQuery=true';
    
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      },
    });

    if (!response.ok) {
      throw new Error(`Yahoo Finance News API error: ${response.status}`);
    }

    const data = await response.json();
    
    // Yahoo Finance has a different structure, try multiple possible paths
    let newsItems: YahooNewsItem[] = [];
    
    if (data.news && Array.isArray(data.news)) {
      newsItems = data.news;
    } else if (data.items && data.items.result && Array.isArray(data.items.result)) {
      newsItems = data.items.result.filter((item: any) => item.type === 'NEWS');
    } else if (data.quotes && Array.isArray(data.quotes)) {
      // Sometimes news is mixed with quotes
      newsItems = data.quotes.filter((item: any) => item.type === 'NEWS');
    }

    return newsItems;
  } catch (error) {
    console.error('Error fetching Yahoo Finance news:', error);
    return [];
  }
};

// Alternative approach: Fetch news for trending stocks
const fetchTrendingStocksNews = async (): Promise<YahooNewsItem[]> => {
  try {
    // Get news for popular stocks
    const symbols = ['AAPL', 'MSFT', 'GOOGL', 'AMZN', 'TSLA', 'META', 'NVDA'];
    const allNews: YahooNewsItem[] = [];

    for (const symbol of symbols.slice(0, 3)) { // Limit to prevent rate limiting
      try {
        const url = `https://query1.finance.yahoo.com/v1/finance/search?q=${symbol}&lang=en-US&region=US&quotesCount=1&newsCount=5&enableFuzzyQuery=false&quotesQueryId=tss_match_phrase_query&multiQuoteQueryId=multi_quote_single_token_query&newsQueryId=news_cie_vespa&enableCb=true&enableNavLinks=true&enableEnhancedTrivialQuery=true`;
        
        const response = await fetch(url, {
          headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
          },
        });

        if (response.ok) {
          const data = await response.json();
          
          if (data.news && Array.isArray(data.news)) {
            allNews.push(...data.news.map((item: any) => ({
              ...item,
              relatedTickers: [symbol]
            })));
          }
        }
      } catch (error) {
        console.error(`Error fetching news for ${symbol}:`, error);
      }
    }

    return allNews;
  } catch (error) {
    console.error('Error fetching trending stocks news:', error);
    return [];
  }
};

// Convert Yahoo Finance news format to our NewsArticle format
const convertToNewsArticle = (item: YahooNewsItem) => {
  const imageUrl = item.thumbnail?.resolutions?.[0]?.url || '';
  const publishTime = new Date(item.providerPublishTime * 1000).toISOString();
  
  return {
    title: item.title || 'Untitled',
    content: '', // Yahoo Finance API doesn't provide full content in search
    date: publishTime,
    author: item.publisher || 'Yahoo Finance',
    site: item.publisher || 'Yahoo Finance',
    image: imageUrl,
    link: item.link || '#',
    tickers: item.relatedTickers || []
  };
};

export async function GET(request: NextRequest) {
  try {
    console.log('Fetching financial news...');

    // Try both approaches and combine results
    const [generalNews, trendingNews] = await Promise.all([
      fetchYahooFinanceNews(),
      fetchTrendingStocksNews()
    ]);

    // Combine and deduplicate news
    const allNews = [...generalNews, ...trendingNews];
    const uniqueNews = allNews.filter((item, index, self) => 
      index === self.findIndex(t => t.uuid === item.uuid || t.title === item.title)
    );

    // Convert to our format
    const articles = uniqueNews.map(convertToNewsArticle);

    // Sort by date (newest first)
    articles.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    console.log(`Successfully fetched ${articles.length} news articles`);

    return NextResponse.json({
      success: true,
      data: articles.slice(0, 20), // Limit to 20 articles
      count: articles.length,
      lastUpdated: new Date().toISOString()
    });

  } catch (error) {
    console.error('News API error:', error);
    
    // Return mock data as fallback
    const mockArticles = [
      {
        title: "Stock Market Reaches New Heights",
        content: "Major indices continue to show strong performance amid positive economic indicators.",
        date: new Date().toISOString(),
        author: "Financial News Team",
        site: "Yahoo Finance",
        image: "",
        link: "#",
        tickers: ["SPY", "QQQ"]
      },
      {
        title: "Tech Stocks Lead Market Rally",
        content: "Technology companies show strong earnings growth in the latest quarter.",
        date: new Date(Date.now() - 86400000).toISOString(), // Yesterday
        author: "Market Analyst",
        site: "Yahoo Finance", 
        image: "",
        link: "#",
        tickers: ["AAPL", "MSFT", "GOOGL"]
      }
    ];
    
    return NextResponse.json({
      success: false,
      error: 'Failed to fetch news data',
      data: mockArticles, // Fallback to mock data
      count: mockArticles.length
    }, { status: 200 }); // Return 200 so the frontend still gets data
  }
}