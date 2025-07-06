#!/usr/bin/env python3
"""
Oura Ring Health Data Analysis Demo

This script demonstrates the OuraAnalysis class functionality using Emma's health data.
It loads the data, performs comprehensive analysis, and generates AI-powered insights.
"""

import os
import sys
from pathlib import Path
from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv()

# Add the current directory to Python path for imports
sys.path.append(str(Path(__file__).parent))

from oura_analysis import OuraAnalysis

def main():
    """Main demo function."""
    print("=" * 80)
    print("🔍 OURA RING HEALTH DATA ANALYSIS DEMO")
    print("=" * 80)
    
    # Define Emma's metadata
    emma_metadata = {
        'name': 'Emma',
        'age': 26,
        'goals': 'performance',
        'activity_level': 'high',
        'focus_areas': ['sleep optimization', 'recovery', 'cardiovascular health']
    }
    
    print("\n👤 USER PROFILE")
    print("-" * 40)
    for key, value in emma_metadata.items():
        print(f"{key.replace('_', ' ').title()}: {value}")
    
    # Initialize the analyzer
    print("\n🚀 INITIALIZING OURA ANALYZER")
    print("-" * 40)
    
    try:
        analyzer = OuraAnalysis(user_metadata=emma_metadata)
        print("✓ OuraAnalysis class initialized successfully")
    except Exception as e:
        print(f"✗ Error initializing analyzer: {e}")
        return
    
    # Load data from cache
    print("\n📁 LOADING HEALTH DATA")
    print("-" * 40)
    
    try:
        analyzer.load_from_cache('data/')
        print(f"✓ Successfully loaded {len(analyzer.health_data)} datasets")
    except Exception as e:
        print(f"✗ Error loading data: {e}")
        return
    
    # Display available datasets
    print("\n📊 AVAILABLE DATASETS")
    print("-" * 40)
    analyzer.list_datasets()
    
    # Run comprehensive analysis
    print("\n🔬 RUNNING COMPREHENSIVE ANALYSIS")
    print("-" * 40)
    
    try:
        analyzer.analyze_all_datasets()
        print("✓ Analysis completed successfully")
    except Exception as e:
        print(f"✗ Error during analysis: {e}")
        return
    
    # Display sample dataset information
    print("\n📈 SAMPLE DATASET ANALYSIS - DAILY ACTIVITY")
    print("-" * 40)
    
    try:
        analyzer.get_dataset_info('daily_activity')
    except Exception as e:
        print(f"✗ Error displaying dataset info: {e}")
    
    # Display key statistics summary
    print("\n📋 KEY STATISTICS SUMMARY")
    print("-" * 40)
    
    for dataset_name in analyzer.summary_stats.keys():
        stats = analyzer.get_summary_stats(dataset_name)
        if stats:
            print(f"\n{dataset_name.replace('_', ' ').title()}:")
            print(f"  • Records: {stats['shape'][0]} days")
            print(f"  • Features: {len(stats['columns'])} columns")
            
            if stats['numeric_summary']:
                numeric_count = len(stats['numeric_summary'])
                print(f"  • Numeric metrics: {numeric_count}")
            
            missing_total = sum(stats['missing_values'].values())
            if missing_total > 0:
                print(f"  • Missing values: {missing_total}")
            else:
                print("  • No missing values ✓")
    
    # Check Claude API availability and generate insights
    print("\n🤖 AI-POWERED HEALTH INSIGHTS")
    print("-" * 40)
    
    api_key = os.getenv("ANTHROPIC_API_KEY")
    if not api_key:
        print("⚠️  ANTHROPIC_API_KEY not found in environment variables")
        print("   To enable AI insights, set your Claude API key:")
        print("   export ANTHROPIC_API_KEY='your-api-key-here'")
        print("\n   Skipping AI analysis for now...")
    else:
        print("🔑 Claude API key found - generating personalized insights...")
        try:
            analyzer.print_personalized_advice()
        except Exception as e:
            print(f"✗ Error generating AI insights: {e}")
    
    # Display data quality summary
    print("\n📊 DATA QUALITY SUMMARY")
    print("-" * 40)
    
    total_datasets = len(analyzer.health_data)
    total_records = sum(df.shape[0] for df in analyzer.health_data.values())
    
    print(f"Total Datasets: {total_datasets}")
    print(f"Total Records: {total_records:,}")
    print(f"Date Range: Approximately 2+ years of health data")
    
    # Show data completeness
    complete_datasets = []
    incomplete_datasets = []
    
    for dataset_name, stats in analyzer.summary_stats.items():
        missing_total = sum(stats['missing_values'].values())
        if missing_total == 0:
            complete_datasets.append(dataset_name)
        else:
            incomplete_datasets.append((dataset_name, missing_total))
    
    print(f"\nComplete datasets ({len(complete_datasets)}):")
    for dataset in complete_datasets:
        print(f"  ✓ {dataset}")
    
    if incomplete_datasets:
        print(f"\nDatasets with missing values ({len(incomplete_datasets)}):")
        for dataset, missing in incomplete_datasets:
            print(f"  ⚠️  {dataset}: {missing} missing values")
    
    print("\n" + "=" * 80)
    print("🎉 DEMO COMPLETED SUCCESSFULLY!")
    print("=" * 80)
    print("\n💡 Next Steps:")
    print("   • Run the Streamlit app: streamlit run oura_streamlit_app.py")
    print("   • Set ANTHROPIC_API_KEY for AI insights")
    print("   • Explore individual dataset plots and statistics")
    print("   • Review saved analysis files in the static/ directory")

if __name__ == "__main__":
    main()