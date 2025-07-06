#!/usr/bin/env python3
"""
Test script to verify aurient_data integration works correctly
"""

import sys
import os
from pathlib import Path
import json

# Add current directory to path
sys.path.append(str(Path(__file__).parent))

try:
    from oura_analysis import OuraAnalysis
    
    print("✅ Successfully imported OuraAnalysis")
    
    # Test metadata
    emma_metadata = {
        'name': 'Emma',
        'age': 26,
        'goals': 'performance',
        'activity_level': 'high',
        'focus_areas': ['sleep optimization', 'recovery', 'cardiovascular health']
    }
    
    print("✅ Created test metadata")
    
    # Initialize analyzer
    analyzer = OuraAnalysis(user_metadata=emma_metadata)
    print("✅ Initialized OuraAnalysis")
    
    # Test data loading
    data_path = Path(__file__).parent / 'data'
    if data_path.exists():
        analyzer.load_from_cache(str(data_path))
        print(f"✅ Loaded data from {data_path}")
        
        # Analyze datasets
        analyzer.analyze_all_datasets()
        print("✅ Analyzed all datasets")
        
        # Test if we have data
        if analyzer.health_data:
            datasets = list(analyzer.health_data.keys())
            total_records = sum(df.shape[0] for df in analyzer.health_data.values())
            print(f"✅ Found {len(datasets)} datasets with {total_records} total records")
            print(f"   Datasets: {', '.join(datasets)}")
        else:
            print("⚠️  No health data loaded")
        
        # Test environment variable for API key
        api_key = os.getenv("ANTHROPIC_API_KEY")
        if api_key:
            print("✅ Anthropic API key found in environment")
            # Test advice generation (won't actually call API in test)
            try:
                # This should work without calling the API
                prompt = analyzer.get_analysis_prompt()
                if prompt and len(prompt) > 100:
                    print("✅ Analysis prompt generation works")
                else:
                    print("⚠️  Analysis prompt seems too short")
            except Exception as e:
                print(f"❌ Error generating analysis prompt: {e}")
        else:
            print("⚠️  No Anthropic API key found - AI features will not work")
            
    else:
        print(f"❌ Data directory not found at {data_path}")
        
except ImportError as e:
    print(f"❌ Import error: {e}")
except Exception as e:
    print(f"❌ Unexpected error: {e}")
    
print("\n" + "="*50)
print("Integration test complete!")