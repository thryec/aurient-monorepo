import { NextRequest, NextResponse } from 'next/server';
import { exec } from 'child_process';
import { promisify } from 'util';
import path from 'path';

const execAsync = promisify(exec);

export async function GET(request: NextRequest) {
  try {
    // Path to the aurient_data directory
    const aurientDataPath = path.join(process.cwd(), '..', 'aurient_data');
    
    // Python script to generate overview recommendations
    const pythonScript = `
import sys
import os
import warnings
import logging

# Suppress all warnings and logs
warnings.filterwarnings('ignore')
logging.disable(logging.CRITICAL)

# Redirect stdout to stderr temporarily to capture print statements
original_stdout = sys.stdout
sys.stdout = sys.stderr

sys.path.append('${aurientDataPath}')

from oura_analysis import OuraAnalysis
import json

try:
    # Emma's metadata (this will be modular for different users later)
    emma_metadata = {
        'name': 'Emma',
        'age': 26,
        'goals': 'performance',
        'activity_level': 'high',
        'focus_areas': ['sleep optimization', 'recovery', 'cardiovascular health']
    }
    
    # Initialize analyzer
    analyzer = OuraAnalysis(user_metadata=emma_metadata)
    
    # Load data from cache
    data_path = os.path.join('${aurientDataPath}', 'data')
    analyzer.load_from_cache(data_path)
    
    # Analyze all datasets
    analyzer.analyze_all_datasets()
    
    # Generate personalized advice using structured method
    structured_advice = analyzer.generate_personalized_advice_structured()
    
    # Return JSON response to original stdout
    sys.stdout = original_stdout
    result = {
        'success': True,
        'structured_advice': structured_advice,
        'user_metadata': emma_metadata,
        'data_summary': {
            'datasets': list(analyzer.health_data.keys()) if analyzer.health_data else [],
            'total_records': sum(df.shape[0] for df in analyzer.health_data.values()) if analyzer.health_data else 0
        }
    }
    
    print(json.dumps(result, ensure_ascii=False))
    
except Exception as e:
    sys.stdout = original_stdout
    error_result = {
        'success': False,
        'error': str(e),
        'advice': None
    }
    print(json.dumps(error_result, ensure_ascii=False))
`;

    // Write Python script to temporary file
    const { writeFile, unlink } = require('fs').promises;
    const tmpFile = path.join(process.cwd(), 'tmp_overview_script.py');
    await writeFile(tmpFile, pythonScript);

    try {
      // Execute Python script
      const { stdout, stderr } = await execAsync(`cd "${aurientDataPath}" && python "${tmpFile}"`);
      
      if (stderr) {
        console.error('Python stderr:', stderr);
      }

      // Parse the JSON response from Python
      const result = JSON.parse(stdout);
      
      // Clean up temporary file
      await unlink(tmpFile);
      
      if (result.success) {
        return NextResponse.json({
          success: true,
          data: {
            structured_advice: result.structured_advice,
            userMetadata: result.user_metadata,
            dataSummary: result.data_summary
          }
        });
      } else {
        return NextResponse.json({
          success: false,
          error: result.error
        }, { status: 500 });
      }
      
    } catch (execError) {
      // Clean up temporary file on error
      try {
        await unlink(tmpFile);
      } catch (cleanupError) {
        console.error('Failed to cleanup temp file:', cleanupError);
      }
      throw execError;
    }
    
  } catch (error) {
    console.error('Overview analysis error:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred'
    }, { status: 500 });
  }
}