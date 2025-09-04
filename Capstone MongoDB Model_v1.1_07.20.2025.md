# **Capstone Project MongoDB Database Model**

## **Database Overview**

This database model supports my capstone project with user management, trade journaling, analytics, and chart management capabilities.

---

## **Collection Schemas**

### **1\. users Collection**

{  
  \_id: ObjectId("U1111"),  
  username: "String",  
  password: "String",  
  email: "String",  
  tradingProfile: {  
    experienceLevel: "String", // beginner/intermediate/advanced  
    preferredMarkets: \["Array"\], // \["stocks", "forex", "crypto"\]  
    riskTolerance: "Integer" // 1-5 scale  
  },  
  createdAt: "Date",  
  lastLogin: "Date"  
}

### **2\. trade\_journals Collection**

{  
  \_id: ObjectId("TJ9999"),  
  userId: ObjectId("U1111"), // References users.\_id  
  trades: \[  
    {  
      \_id: ObjectId("trade001"),  
      techniqueId: ObjectId("TECH456"), // References user\_techniques.\_id  
      symbol: "String", // e.g., "AAPL"  
      direction: "String", // "long" or "short"  
      entry: {  
        price: "Decimal",  
        time: "Date",  
        screenshot: "String" // file path  
      },  
      exit: {  
        price: "Decimal",  
        time: "Date",  
        reason: "String",  
        screenshot: "String"  
      },  
      pnl: "Decimal",  
      notes: "String",  
      tags: \["Array"\], // \["large-cap", "technical"\]  
      status: "String" // planned/executed/closed/canceled  
    }  
  \],  
  createdAt: "Date",  
  lastUpdated: "Date"  
}

### **3\. technique\_analytics Collection**

{  
  \_id: ObjectId("TA789"),  
  userId: ObjectId("U1111"), // References users.\_id  
  techniqueId: ObjectId("TECH456"), // References user\_techniques.\_id  
  stats: {  
    totalTrades: "Integer",  
    winningTrades: "Integer",  
    losingTrades: "Integer",  
    winRate: "Decimal", // 0.63 \= 63%  
    totalPnl: "Decimal",  
    averageWin: "Decimal",  
    averageLoss: "Decimal",  
    winLossRatio: "Decimal",  
    longestWinStreak: "Integer",  
    longestLosingStreak: "Integer"  
  },  
  byInstrument: \[  
    {  
      symbol: "String",  
      trades: "Integer",  
      winRate: "Decimal",  
      totalPnl: "Decimal"  
    }  
  \],  
  timeBuckets: {  
    "30d": { winRate: "Decimal", trades: "Integer" },  
    "90d": { winRate: "Decimal", trades: "Integer" }  
  }  
}

### **4\. instrument\_analytics Collection**

{  
  \_id: ObjectId("IA456"),  
  userId: ObjectId("U1111"), // References users.\_id  
  symbol: "String", // e.g., "AAPL"  
  stats: {  
    totalTrades: "Integer",  
    winningTrades: "Integer",  
    losingTrades: "Integer",  
    winRate: "Decimal",  
    totalPnl: "Decimal",  
    averageWin: "Decimal",  
    averageLoss: "Decimal",  
    winLossRatio: "Decimal"  
  },  
  byTechnique: \[  
    {  
      techniqueId: ObjectId("TECH456"), // References user\_techniques.\_id  
      trades: "Integer",  
      winRate: "Decimal",  
      totalPnl: "Decimal"  
    }  
  \],  
  heatmapData: \[  
    {  
      technique: "String",  
      pnl: "Decimal",  
      winRate: "Decimal",  
      frequency: "String" // high/medium/low  
    }  
  \]  
}

### **5\. user\_techniques Collection**

{  
  \_id: ObjectId("UT123"),  
  userId: ObjectId("U1111"), // References users.\_id  
  techniqueId: ObjectId("TECH456"), // Base strategy reference  
  customName: "String",  
  notes: "String",  
  customSteps: \[  
    {  
      order: "Integer",  
      action: "String"  
    }  
  \],  
  lastUsed: "Date"  
}

### **6\. user\_charts Collection**

{  
  \_id: ObjectId("CHART888"),  
  userId: ObjectId("U1111"), // References users.\_id  
  title: "String",  
  symbols: \["Array"\], // \["QQQ", "NDX"\]  
  timeframes: \["Array"\], // \["1D", "4H"\]  
  indicators: \[  
    {  
      name: "String", // "EMA", "RSI"  
      period: "Integer"  
    }  
  \],  
  drawingTools: \[  
    {  
      type: "String", // "trendline", "support", "resistance"  
      points: \[  
        {  
          x: "String", // date or time  
          y: "Decimal" // price level  
        }  
      \]  
    }  
  \],  
  lastUpdated: "Date"  
}

### **7\. heatmaps Collection**

{  
  \_id: ObjectId("HEAT123"),  
  userId: ObjectId("U1111"), // References users.\_id  
  data: \[  
    {  
      technique: "String",  
      symbol: "String",  
      pnl: "Decimal",  
      winRate: "Decimal",  
      frequency: "String" // high/medium/low  
    }  
  \]  
}

---

## **Relationships**

### **Primary Relationships**

* **users** → **trade\_journals** (1:N via userId)  
* **users** → **technique\_analytics** (1:N via userId)  
* **users** → **instrument\_analytics** (1:N via userId)  
* **users** → **user\_techniques** (1:N via userId)  
* **users** → **user\_charts** (1:N via userId)  
* **users** → **heatmaps** (1:N via userId)

### **Cross-References**

* **user\_techniques** → **technique\_analytics** (via techniqueId)  
* **user\_techniques** → **instrument\_analytics** (via techniqueId)  
* **user\_techniques** → **trade\_journals.trades** (via techniqueId)

---

