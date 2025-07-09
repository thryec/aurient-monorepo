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
print('SUMMARY STATS:', analyzer.summary_stats)

# Get insights for specific dataset
analyzer.get_dataset_info('daily_activity')
stats = analyzer.get_summary_stats('daily_sleep')

# Generate AI-powered advice
analyzer.print_personalized_advice()