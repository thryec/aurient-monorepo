# Oura Health Analytics

A comprehensive analysis system for Oura Ring health data with AI-powered insights.

## Features

- 📊 **Comprehensive Data Analysis**: Analyze 14 different health datasets from Oura Ring
- 🤖 **AI-Powered Insights**: Get personalized health advice using Claude 3.5 Sonnet
- 📈 **Interactive Visualizations**: Explore your data with interactive plots
- 🎯 **Personalized Recommendations**: Tailored advice based on your age, goals, and health patterns
- 💾 **Data Dictionary**: Comprehensive explanations of all health metrics

## Quick Start

### 1. Run the Demo Script

```bash
cd aurient_data
python oura_demo.py
```

This will:
- Load Emma's sample health data
- Run comprehensive analysis on all datasets
- Display summary statistics
- Generate AI insights (if API key is available)

### 2. Launch Interactive Dashboard

```bash
streamlit run oura_streamlit_app.py
```

This opens a web interface with:
- **AI Insights Tab**: Generate and view personalized health advice
- **Dataset Tabs**: Interactive analysis for each health metric
- **Visualizations**: Histograms, correlations, and statistics
- **Data Quality**: Missing values, data types, and completeness

## Setup Requirements

### Install Dependencies

```bash
# Install all required packages
poetry install

# Or with pip
pip install pandas numpy matplotlib seaborn plotly streamlit anthropic
```

### Enable AI Insights (Optional)

For AI-powered health recommendations, set your Claude API key:

```bash
export ANTHROPIC_API_KEY='your-api-key-here'
```

## Data Structure

The system analyzes these Oura Ring datasets:

### Core Metrics
- **Daily Activity**: Steps, calories, MET minutes, activity classifications
- **Daily Sleep**: Sleep scores, efficiency, duration metrics
- **Daily Readiness**: Recovery scores, HRV balance, temperature deviations

### Advanced Metrics  
- **Heart Rate**: Continuous heart rate monitoring
- **Sleep Detailed**: REM, deep sleep, sleep phases, heart rate during sleep
- **Cardiovascular Age**: Estimated vascular age based on HRV
- **VO2 Max**: Cardiovascular fitness indicator
- **Daily Stress**: Stress and recovery periods
- **Daily SpO2**: Blood oxygen saturation
- **Daily Resilience**: Stress resilience metrics

### Activity Tracking
- **Workouts**: Exercise sessions with intensity and duration
- **Sessions**: Meditation, breathing exercises, and recovery sessions
- **Tags**: User annotations for periods, illness, or life events

## File Structure

```
aurient_data/
├── oura_analysis.py          # Main analysis class
├── oura_demo.py              # Demo script
├── oura_streamlit_app.py     # Interactive dashboard
├── eda.ipynb                 # Jupyter notebook analysis
├── static/
│   ├── oura_data_dictionary.json    # Field definitions
│   └── health_advice_*.md           # Generated AI insights
└── data/                     # Health data CSV files
    ├── dailyactivity_*.csv
    ├── dailysleep_*.csv
    └── ...
```

## Example Usage

### Python Script

```python
from oura_analysis import OuraAnalysis

# Setup user profile
user_metadata = {
    'name': 'Emma',
    'age': 26,
    'goals': 'performance'
}

# Initialize analyzer
analyzer = OuraAnalysis(user_metadata=user_metadata)

# Load and analyze data
analyzer.load_from_cache('data/')
analyzer.analyze_all_datasets()

# Get insights for specific dataset
analyzer.get_dataset_info('daily_activity')
stats = analyzer.get_summary_stats('daily_sleep')

# Generate AI-powered advice
analyzer.print_personalized_advice()
```

### Interactive Dashboard

1. Launch: `streamlit run oura_streamlit_app.py`
2. Navigate between tabs to explore different datasets
3. View interactive plots and statistics
4. Generate AI insights in the main tab

## AI Insights

When enabled, the system provides personalized recommendations in four categories:

### 🧠 Behavioral Recommendations
- Sleep hygiene and timing optimization
- Daily routine adjustments
- Stress management techniques

### 🏃‍♀️ Exercise Recommendations
- Workout timing based on readiness scores
- Recovery protocols
- Training intensity adjustments

### 🥗 Nutrition Recommendations
- Meal timing for better sleep
- Nutritional strategies for recovery
- Hydration guidelines

### 💊 Supplementation Recommendations
- Evidence-based supplements
- Timing and dosage suggestions
- Goal-specific recommendations

## Data Privacy

- All analysis runs locally on your machine
- Health data never leaves your device (except for AI analysis if enabled)
- AI insights use aggregated statistics, not raw health data
- Generated advice is saved locally as markdown files

## Troubleshooting

### Common Issues

1. **Import Errors**: Ensure all dependencies are installed
2. **Data Not Found**: Check that CSV files are in the `data/` directory
3. **API Errors**: Verify your `ANTHROPIC_API_KEY` is set correctly
4. **Streamlit Issues**: Try restarting the app with `Ctrl+C` then rerun

### Performance Tips

- The first run may take longer as data is loaded and cached
- Large datasets benefit from sufficient RAM (8GB+ recommended)
- Interactive plots work best with recent browsers

## Support

For issues or questions:
1. Check this README
2. Review error messages in the console
3. Ensure all dependencies are correctly installed
4. Verify data file paths and formats