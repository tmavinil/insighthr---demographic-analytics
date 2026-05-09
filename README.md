# InsightHR Demographic Analytics

InsightHR Demographic Analytics is a powerful, React-based dashboard application designed to help HR professionals and managers visualize and analyze employee demographics, workforce trends, and turnover rates. It provides interactive charts and includes an AI-powered "Smart Insights" feature that leverages the Google Gemini API to analyze your workforce data and offer actionable recommendations.

## What the Tool Does

- **Workforce Analytics:** View key metrics such as active headcount, turnover rate, average tenure, and employee age.
- **Interactive Dashboards:** Visualize departmental breakdowns and employee distributions using rich, interactive charts.
- **Smart Insights:** Utilize AI (powered by Google Gemini) to generate deep insights and suggestions based on your demographic data.
- **Data Ingestion:** Upload your own employee data via CSV format or explore the app using built-in sample data.
- **Multilingual & Customizable:** Support for multiple languages and customizable interface themes.
- **Export Capabilities:** Export workforce rosters and data directly to CSV.

## How to Use the Tool Online

You can access and run the application online without any local installation:

**View the app here:**

Once online:
1. Upload your CSV file containing employee data or click "Try Sample Data".
2. Navigate through the dashboard to view metrics and charts.
3. To enable **Smart Insights**, enter your Gemini API key when prompted in the UI to unlock AI-driven analysis.

## How to Implement it on a Local Server

To run the application on your local machine, follow these steps:

### Prerequisites

- **Node.js** (v18 or higher recommended)
- **npm** (Node Package Manager)
- Optional: A **Google Gemini API Key** (required for the AI Smart Insights feature)

### Installation Steps

1. **Clone the repository:**
   ```bash
   git clone <your-repository-url>
   cd insighthr---demographic-analytics
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```
``

3. **Start the Development Server:**
   ```bash
   npm run dev
   ```

4. **Access the App:**
   Open your browser and navigate to `http://localhost:3000` to interact with the application.

## Tool Requirements

- **Runtime:** Node.js
- **Frameworks & Libraries:** React 19, Vite, Tailwind CSS, Recharts, Framer Motion, PapaParse, Google GenAI SDK.
- **External Services:** Google Gemini API (for Smart Insights).
- **Browser:** Any modern web browser (Chrome, Firefox, Safari, Edge).

## Disclaimer

- **Disclaimer** This tool is provided "as is" for informational purposes only. Users are responsible for validating all results and data accuracy. We assume no responsibility for the data added or the insights generated. Your data is processed locally and is not stored on any server.

## Sample Images With Sample Data

![Insight HR 1](src/images/Insight%20HR1.jpg)

![Insight HR 2](src/images/Insight%20HR2.jpg)

![Insight HR 3](src/images/Insight%20HR3.jpg)

![Insight HR 4](src/images/Insight%20HR4.jpg)

![InsightHR AI Insights](src/images/InsightHR%20AI%20Insights.jpg)