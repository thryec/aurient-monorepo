import pandas as pd
import numpy as np
import matplotlib.pyplot as plt
import seaborn as sns
import json
from pathlib import Path
from typing import Dict, Any, Optional, Tuple
import warnings
import anthropic
import os
from datetime import datetime
from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv()

warnings.filterwarnings('ignore')


class OuraAnalysis:
    """
    A class for analyzing Oura Ring health data with comprehensive statistics and visualizations.
    """
    
    def __init__(self, health_data: Optional[Dict[str, pd.DataFrame]] = None, 
                 user_metadata: Optional[Dict[str, Any]] = None):
        """
        Initialize the OuraAnalysis class.
        
        Args:
            health_data: Dictionary of DataFrames with health data
            user_metadata: Dictionary with user information (name, age, goals, etc.)
        """
        self.health_data = health_data or {}
        self.user_metadata = user_metadata or {}
        self.data_dictionary = self._load_data_dictionary()
        self.summary_stats = {}
        self.plots = {}
        self.claude_client = None
        
        # Initialize Claude client if API key is available
        self._init_claude_client()
        
        # Set up plotting style
        plt.style.use('default')
        sns.set_palette("husl")
        
    def _init_claude_client(self) -> None:
        """Initialize the Claude API client."""
        api_key = os.getenv("ANTHROPIC_API_KEY")
        if api_key:
            try:
                self.claude_client = anthropic.Anthropic(api_key=api_key)
                print("✓ Claude API client initialized")
            except Exception as e:
                print(f"Warning: Failed to initialize Claude client: {e}")
        else:
            print("Warning: ANTHROPIC_API_KEY not found in environment variables")
    
    def _load_data_dictionary(self) -> Dict[str, Dict[str, str]]:
        """Load the Oura data dictionary from JSON file."""
        dict_path = Path(__file__).parent / "static" / "oura_data_dictionary.json"
        try:
            with open(dict_path, 'r') as f:
                return json.load(f)
        except FileNotFoundError:
            print(f"Warning: Data dictionary not found at {dict_path}")
            return {}
    
    def load_from_cache(self, data_dir: str = "data/") -> None:
        """
        Load health data from CSV files in the specified directory.
        
        Args:
            data_dir: Directory containing the CSV files
        """
        data_path = Path(data_dir)
        
        file_mappings = {
            'dailyactivity_2023-01-07_2025-06-18.csv': 'daily_activity',
            'dailycardiovascularage_2023-01-07_2025-06-18.csv': 'cardiovascular_age',
            'dailyreadiness_2023-01-07_2025-06-18.csv': 'daily_readiness',
            'dailyresilience_2023-01-07_2025-06-18.csv': 'daily_resilience',
            'dailysleep_2023-01-07_2025-06-18.csv': 'daily_sleep',
            'dailyspo2_2023-01-07_2025-06-18.csv': 'daily_spo2',
            'dailystress_2023-01-07_2025-06-18.csv': 'daily_stress',
            'heartrate_2023-01-07_2025-06-18.csv': 'heart_rate',
            'ringconfiguration_2023-01-07_2025-06-18.csv': 'ring_config',
            'session_2023-01-07_2025-06-18.csv': 'sessions',
            'sleep_2023-01-07_2025-06-18.csv': 'sleep_detailed',
            'tag_2023-01-07_2025-06-18.csv': 'tags',
            'vo2max_2023-01-07_2025-06-18.csv': 'vo2_max',
            'workout_2023-01-07_2025-06-18.csv': 'workouts'
        }
        
        self.health_data = {}
        print("Loading health data files...")
        
        for filename, key in file_mappings.items():
            file_path = data_path / filename
            if file_path.exists():
                try:
                    df = pd.read_csv(file_path)
                    self.health_data[key] = df
                    print(f"✓ Loaded {key}: {df.shape[0]} rows, {df.shape[1]} columns")
                except Exception as e:
                    print(f"✗ Error loading {filename}: {e}")
            else:
                print(f"✗ File not found: {filename}")
        
        print(f"\\nSuccessfully loaded {len(self.health_data)} datasets")
    
    def analyze_dataset(self, dataset_name: str, df: pd.DataFrame) -> Tuple[Dict[str, Any], plt.Figure]:
        """
        Generate summary statistics and plots for a single dataset.
        
        Args:
            dataset_name: Name of the dataset
            df: DataFrame to analyze
            
        Returns:
            Tuple of (summary_stats_dict, matplotlib_figure)
        """
        stats = {
            'dataset_name': dataset_name,
            'shape': df.shape,
            'columns': list(df.columns),
            'missing_values': df.isnull().sum().to_dict(),
            'data_types': df.dtypes.to_dict()
        }
        
        # Get numeric columns for statistical analysis
        numeric_cols = df.select_dtypes(include=[np.number]).columns.tolist()
        
        if numeric_cols:
            stats['numeric_summary'] = df[numeric_cols].describe().to_dict()
            stats['correlations'] = df[numeric_cols].corr().to_dict() if len(numeric_cols) > 1 else {}
        else:
            stats['numeric_summary'] = {}
            stats['correlations'] = {}
        
        # Generate plots
        fig = self._create_plots(dataset_name, df, numeric_cols)
        
        return stats, fig
    
    def _create_plots(self, dataset_name: str, df: pd.DataFrame, numeric_cols: list) -> plt.Figure:
        """
        Create comprehensive plots for a dataset.
        
        Args:
            dataset_name: Name of the dataset
            df: DataFrame to plot
            numeric_cols: List of numeric columns
            
        Returns:
            matplotlib Figure object
        """
        if not numeric_cols:
            # Create a simple info plot for non-numeric datasets
            fig, ax = plt.subplots(1, 1, figsize=(8, 6))
            ax.text(0.5, 0.5, f'{dataset_name}\\n\\nShape: {df.shape}\\nNo numeric columns for plotting', 
                   ha='center', va='center', fontsize=12)
            ax.set_xlim(0, 1)
            ax.set_ylim(0, 1)
            ax.axis('off')
            plt.suptitle(f'{dataset_name.replace("_", " ").title()} Dataset Info', fontsize=14)
            return fig
        
        # Determine subplot layout based on number of numeric columns
        n_cols = min(len(numeric_cols), 4)  # Max 4 columns per row
        n_rows = (len(numeric_cols) + n_cols - 1) // n_cols
        n_rows = max(n_rows, 2)  # Minimum 2 rows for layout
        
        fig, axes = plt.subplots(n_rows, n_cols, figsize=(5*n_cols, 4*n_rows))
        fig.suptitle(f'{dataset_name.replace("_", " ").title()} Analysis', fontsize=16, y=0.98)
        
        # Flatten axes array for easier indexing
        if n_rows == 1:
            axes = [axes] if n_cols == 1 else axes
        else:
            axes = axes.flatten() if hasattr(axes, 'flatten') else [axes]
        
        # Create histograms for each numeric column
        for i, col in enumerate(numeric_cols):
            if i < len(axes):
                ax = axes[i]
                
                # Skip columns with all missing values
                if df[col].dropna().empty:
                    ax.text(0.5, 0.5, f'{col}\\n(No data)', ha='center', va='center')
                    ax.set_xlim(0, 1)
                    ax.set_ylim(0, 1)
                    continue
                
                # Create histogram
                df[col].dropna().hist(bins=30, ax=ax, alpha=0.7)
                ax.set_title(f'{col} Distribution')
                ax.set_xlabel(col)
                ax.set_ylabel('Frequency')
                
                # Add mean line
                mean_val = df[col].mean()
                if not np.isnan(mean_val):
                    ax.axvline(mean_val, color='red', linestyle='--', 
                              label=f'Mean: {mean_val:.2f}')
                    ax.legend()
        
        # Hide empty subplots
        for i in range(len(numeric_cols), len(axes)):
            axes[i].set_visible(False)
        
        plt.tight_layout()
        return fig
    
    def analyze_all_datasets(self) -> None:
        """
        Run analysis on all datasets and store results in the instance.
        """
        if not self.health_data:
            print("No health data loaded. Use load_from_cache() first.")
            return
        
        print("Analyzing all datasets...")
        self.summary_stats = {}
        self.plots = {}
        
        for dataset_name, df in self.health_data.items():
            print(f"\\nAnalyzing {dataset_name}...")
            
            try:
                stats, fig = self.analyze_dataset(dataset_name, df)
                self.summary_stats[dataset_name] = stats
                self.plots[dataset_name] = fig
                print(f"✓ Completed analysis for {dataset_name}")
                
            except Exception as e:
                print(f"✗ Error analyzing {dataset_name}: {e}")
        
        print(f"\\nCompleted analysis for {len(self.summary_stats)} datasets")
    
    def get_dataset_info(self, dataset_name: str) -> None:
        """
        Print detailed information about a specific dataset.
        
        Args:
            dataset_name: Name of the dataset to describe
        """
        if dataset_name not in self.health_data:
            print(f"Dataset '{dataset_name}' not found.")
            return
        
        df = self.health_data[dataset_name]
        print(f"\\n{dataset_name.replace('_', ' ').title()} Dataset Information")
        print("=" * 60)
        print(f"Shape: {df.shape[0]} rows, {df.shape[1]} columns")
        print(f"Memory usage: {df.memory_usage(deep=True).sum() / 1024**2:.2f} MB")
        
        if dataset_name in self.data_dictionary:
            print("\\nColumn Descriptions:")
            for col in df.columns:
                if col in self.data_dictionary[dataset_name]:
                    desc = self.data_dictionary[dataset_name][col]
                    print(f"  {col}: {desc}")
                else:
                    print(f"  {col}: (No description available)")
        
        print("\\nData Types:")
        print(df.dtypes)
        
        print("\\nMissing Values:")
        missing = df.isnull().sum()
        if missing.sum() > 0:
            print(missing[missing > 0])
        else:
            print("No missing values")
        
        # Show first few rows
        print("\\nFirst 3 rows:")
        print(df.head(3))
    
    def show_plot(self, dataset_name: str) -> None:
        """
        Display the plot for a specific dataset.
        
        Args:
            dataset_name: Name of the dataset
        """
        if dataset_name not in self.plots:
            print(f"No plot available for '{dataset_name}'. Run analyze_all_datasets() first.")
            return
        
        plt.figure(figsize=(12, 8))
        self.plots[dataset_name].show()
    
    def get_summary_stats(self, dataset_name: str) -> Dict[str, Any]:
        """
        Get summary statistics for a specific dataset.
        
        Args:
            dataset_name: Name of the dataset
            
        Returns:
            Dictionary with summary statistics
        """
        if dataset_name not in self.summary_stats:
            print(f"No statistics available for '{dataset_name}'. Run analyze_all_datasets() first.")
            return {}
        
        return self.summary_stats[dataset_name]
    
    def list_datasets(self) -> None:
        """Print all available datasets."""
        if not self.health_data:
            print("No datasets loaded.")
            return
        
        print("Available datasets:")
        for name, df in self.health_data.items():
            print(f"  {name}: {df.shape[0]} rows, {df.shape[1]} columns")
    
    def _prepare_stats_summary(self) -> str:
        """Prepare a concise summary of key statistics for Claude analysis."""
        if not self.summary_stats:
            return "No analysis data available. Please run analyze_all_datasets() first."
        
        summary_text = "## Health Data Summary\n\n"
        
        for dataset_name, stats in self.summary_stats.items():
            summary_text += f"### {dataset_name.replace('_', ' ').title()}\n"
            summary_text += f"- Records: {stats['shape'][0]} days of data\n"
            summary_text += f"- Columns: {len(stats['columns'])}\n"
            
            # Add key numeric statistics
            if stats['numeric_summary']:
                summary_text += "- Key Metrics:\n"
                for col, summary in list(stats['numeric_summary'].items())[:5]:  # Top 5 columns
                    if 'mean' in summary and 'std' in summary:
                        mean_val = summary['mean']
                        std_val = summary['std']
                        summary_text += f"  - {col}: Mean = {mean_val:.2f}, Std = {std_val:.2f}\n"
            
            # Add missing data info
            missing_total = sum(stats['missing_values'].values())
            if missing_total > 0:
                summary_text += f"- Missing data: {missing_total} total missing values\n"
            
            summary_text += "\n"
        
        return summary_text
    
    def get_analysis_prompt(self) -> str:
        """
        Generate and return the prompt that would be sent to Claude API.
        
        Returns:
            String containing the complete prompt for Claude analysis
        """
        if not self.summary_stats:
            return "No analysis data available. Please run analyze_all_datasets() first."
        
        # Prepare the data summary
        stats_summary = self._prepare_stats_summary()
        md_report ="""# Evidence-Based Women's Health Optimization Using Wearable Technology

Comprehensive research reveals that **progesterone-driven physiological changes across the menstrual cycle fundamentally alter all major wearable metrics**, requiring cycle-integrated approaches for accurate health optimization. Recent large-scale studies analyzing over 45,000 menstrual cycles demonstrate that women's health recommendations must account for significant phase-specific variations in heart rate variability, resting heart rate, and body temperature. This evidence-based framework provides actionable strategies for developing personalized women's health applications that leverage wearable technology data while addressing the unique physiological patterns of female health across diverse age ranges, fitness levels, and health conditions.

The clinical significance extends beyond simple tracking - HRV suppression during the luteal phase correlates directly with premenstrual mood symptoms, while phase-specific recovery patterns influence injury risk and training adaptations. Contraceptive use fundamentally alters these patterns, requiring separate algorithmic approaches for synthetic hormone users. This research synthesis establishes the foundation for evidence-based app development that moves beyond one-size-fits-all approaches to deliver truly personalized women's health optimization.

## General wellness optimization for women using wearable data

**Progesterone emerges as the primary hormonal driver** of cardiovascular changes throughout the menstrual cycle, with profound implications for wellness optimization strategies. Large-scale research involving 11,590 participants across 45,811 cycles reveals that traditional single-baseline approaches fail to capture the dynamic nature of women's physiology.

### Foundational cycle-aware metrics establish personalized baselines

Heart rate variability demonstrates the most significant cyclical variation, with **RMSSD peaking around day 5 (follicular phase) and reaching minimum values around day 27 (late luteal phase)**. This represents more than measurement noise - the progesterone-induced HRV suppression directly correlates with reduced stress resilience and premenstrual symptom severity. Resting heart rate follows predictable patterns, increasing 2-7 beats per minute from follicular to luteal phases due to progesterone-induced sympathetic nervous system activation.

Body temperature tracking via wearable devices shows **90% accuracy for ovulation detection** when combined with other physiological metrics. The traditional biphasic temperature pattern, while clinically validated, benefits from sophisticated cosinor modeling that accounts for individual oscillation patterns rather than simple before-and-after comparisons.

### Phase-specific wellness recommendations optimize health outcomes

**Early follicular phase (days 1-5)** represents a recovery optimization window. Peak HRV values during this period indicate maximum stress resilience and adaptation capacity. Wellness applications should capitalize on this physiological state by recommending challenging stress exposure, intensive recovery protocols, and establishment of new health routines.

**Late follicular phase (days 6-14)** provides the optimal performance window for most health interventions. Enhanced recovery capacity, peak cardiovascular resilience, and stable hormonal patterns make this the ideal time for progressive overload in exercise, intensive stress management training, and implementation of challenging lifestyle changes.

**Luteal phase (days 15-28)** requires modified approaches acknowledging reduced stress adaptation capacity. HRV decreases of 15-20% from follicular baselines indicate the need for extended recovery periods, intensified stress management protocols, and gentler introduction of new health interventions. Temperature regulation challenges during this phase require enhanced hydration strategies and environmental cooling approaches.

### Contraceptive considerations fundamentally alter recommendations

Oral contraceptive pills create **significantly attenuated cardiovascular patterns** compared to natural cycles. Research demonstrates no significant HRV differences between high and low hormone phases in OCP users, eliminating the cycle-based optimization advantages available to naturally cycling women. This population requires separate algorithmic approaches emphasizing sleep quality, nutrition optimization, and stress management over hormonal cycle tracking.

The clinical implications extend to all major wearable metrics - recovery recommendations for contraceptive users should focus on non-hormonal indicators while maintaining different baseline ranges for cardiovascular parameters.

## Fitness and performance optimization specific to women

Evidence-based fitness optimization using wearable technology reveals **only trivial performance differences between menstrual cycle phases**, but recovery needs vary dramatically. Meta-analyses of 73 studies establish that while absolute performance capacity remains relatively stable, the physiological cost and recovery requirements fluctuate significantly throughout the cycle.

### HRV-guided training protocols enhance women's fitness outcomes

**Root mean square of successive differences (lnRMSSD) serves as the optimal metric** for training readiness in women. Morning measurements during the last 5 minutes of slow-wave sleep provide the most reliable data for training decisions. Research demonstrates 33% greater strength improvements with HRV-guided periodization compared to predetermined training schedules.

Implementation requires establishing separate baselines for follicular versus luteal phases. When HRV exceeds 102% of phase-specific baseline, proceed with planned high-intensity work. Values between 98-102% indicate moderate training with potential adjustments, while readings below 98% signal the need for reduced intensity or active recovery protocols.

### Cycle-based periodization strategies show promising results

**Follicular phase-focused training** demonstrates superior strength and muscle mass adaptations in controlled studies. Research by Sung et al. showed 42% greater strength gains and 46% more muscle growth when training frequency concentrated in the first two weeks versus the second two weeks of the cycle. The IMPACT Study, currently underway with 120 well-trained women, will provide definitive evidence for optimal periodization strategies.

**Practical implementation** involves scheduling 4-5 strength sessions and 2-3 high-intensity endurance sessions during the follicular phase, while emphasizing technique refinement, power development, and recovery modalities during the luteal phase. This approach capitalizes on enhanced protein synthesis and reduced exercise-induced muscle damage during high-estrogen phases.

### Recovery optimization using wearable data addresses gender-specific patterns

**Sleep quality emerges as the single most predictive factor** for injury prevention in female athletes, with greater than 8 hours of sleep reducing injury odds by 61%. Wearable sleep tracking provides actionable insights for recovery optimization, particularly important given women's increased susceptibility to sleep disruption during luteal phases.

Metabolically suppressed female athletes demonstrate significantly lower HRV values (81±27 ms versus 110±35 ms in healthy athletes), establishing wearable-derived HRV as a practical screening tool for energy deficiency - a condition disproportionately affecting women athletes.

### Load management principles prevent overtraining and injury

**Player load metrics customized for women** account for cycle-specific capacity changes and positional demands. Acute-to-chronic workload ratios require adjustment for luteal phase capacity reductions, with research suggesting 10-15% decreases in strength endurance and voluntary activation during high-progesterone phases.

Critical implementation involves monitoring the convergence of multiple wearable metrics - consistently low HRV combined with elevated resting heart rate and poor sleep quality indicates potential overreaching requiring immediate intervention.

## Sleep improvement strategies for women based on wearable metrics

**Consumer wearables demonstrate 86-89% accuracy for sleep-wake detection** with variable performance for specific sleep stages, providing sufficient precision for practical sleep optimization in women. The integration of multiple metrics - HRV, temperature, and sleep architecture - enables personalized approaches that account for menstrual cycle influences on sleep quality.

### Menstrual cycle effects on sleep architecture require targeted interventions

**Core body temperature increases of 0.3-0.7°C during the luteal phase** directly impact sleep quality through altered thermoregulation. Wearable temperature data from devices like the Oura Ring successfully track these oscillations across cycles, enabling personalized sleep environment recommendations.

**Sleep architecture changes** include reduced REM sleep and increased slow-wave sleep during the luteal phase, accompanied by subjective sleep quality decline premenstrually. Heart rate variability decreases and resting heart rate increases create measurable signatures that wearables can detect and use for intervention timing.

### Phase-specific sleep optimization protocols improve outcomes

**Follicular phase strategies** leverage naturally higher HRV and lower core temperature for intensive recovery. Earlier bedtime recommendations capitalize on natural temperature drops, while the enhanced recovery capacity supports more intensive exercise programs that improve sleep quality.

**Luteal phase adaptations** address elevated core temperature through cooler sleep environments, earlier bedtime recommendations to compensate for potential fragmentation, and increased focus on stress management techniques due to reduced HRV. Targeted interventions for bloating and breast tenderness help optimize sleep positioning and comfort.

**Menstruation phase protocols** emphasize comfort optimization through heated sleep environments for cramp relief and allowance for longer sleep opportunities to compensate for quality reduction. Pain management integration with sleep position recommendations provides comprehensive support during symptomatic phases.

### Age-related sleep considerations span the reproductive lifespan

**Reproductive years (18-35)** benefit from full menstrual cycle optimization using temperature and HRV data. Integration with career demands requires circadian rhythm maintenance strategies for shift work and travel, while performance optimization aligns training and recovery with hormonal patterns.

**Perimenopause (40-55)** presents unique challenges requiring adaptive algorithms for irregular cycles. Vasomotor symptoms detected through temperature monitoring enable targeted hot flash management, while increased sleep fragmentation demands enhanced focus on sleep efficiency and wake episode reduction.

**Postmenopause (55+)** shifts emphasis to circadian rhythm stability through consistent sleep-wake patterns. Stable temperature monitoring enables sleep optimization without cycle considerations, while integration with other health conditions affecting sleep becomes increasingly important.

### Evidence-based interventions demonstrate measurable improvements

**Sleep hygiene interventions** show statistically significant improvements in sleep duration, efficiency, and quality in 7 of 9 recent studies when individualized to wearable metrics rather than using generic approaches. Automated coaching systems like WHOOP 4.0 and Rise Science provide personalized recommendations based on HRV, sleep debt, and circadian phase calculations.

**HRV-guided recovery protocols** establish 2-4 week baseline periods for individual pattern recognition. Rising HRV trends indicate successful recovery, while declining patterns signal the need for extended recovery periods or stress intervention. Sleep debt management using wearable data enables strategic recovery periods aligned with performance demands.

## Stress management approaches using wearable data for women

**Heart rate variability serves as the gold standard biomarker** for autonomic nervous system assessment and stress management in women, with research demonstrating significant cyclical fluctuations that require phase-aware interpretation. Meta-analyses confirm HRV decreases progressively from menstrual through proliferative to secretory phases, with sympathetic nervous activity predominating during luteal phases while parasympathetic activity peaks during follicular phases.

### Real-time stress detection enables just-in-time interventions

**Validated stress biomarkers** tracked by consumer wearables include HRV patterns (higher HRV indicating better stress resilience), heart rate elevation, sleep quality deterioration, and emerging sweat-based cortisol detection. Large-scale studies with over 1,000 subjects confirm associations between wearable physiological signals and self-reported daily-life stress.

**Machine learning approaches** achieve 85% accuracy for stress state classification using random forest models combining HRV, sleep, activity, and contextual data. Individual baseline establishment over 2-4 weeks enables personalized detection models that outperform population-based approaches.

### Evidence-based interventions demonstrate measurable physiological improvements

**Breathing exercises paced at 6 breaths per minute** significantly increase HRV parameters including SDNN, LF power, and improve LF/HF ratios. Four-week resonance breathing training shows lasting improvements in stress resilience, cognitive performance, and perceived stress reduction. Extended exhale techniques specifically stimulate parasympathetic activity for immediate stress relief.

**HRV biofeedback training** at individual optimal frequencies provides superior outcomes compared to generic protocols. Real-time wearable feedback during coherent breathing exercises (5 breaths per minute) optimizes HRV responses and builds long-term stress resilience.

**Mindfulness interventions** delivered through smartwatch notifications show effectiveness in improving RMSSD (parasympathetic activity) and reducing perceived stress in 10-day protocols. Just-in-time adaptive interventions (JITAIs) that incorporate menstrual cycle phase as a time-varying factor demonstrate enhanced effectiveness.

### Cycle-aware stress management addresses hormonal influences

**Late luteal and menstrual phases** require intensified intervention approaches due to decreased estrogen levels creating higher perceived stress scores and increased cortisol reactivity. Wearable applications should automatically adjust intervention frequency and intensity during these vulnerable periods.

**Follicular phase opportunities** capitalize on lower stress perception and higher stress resilience for building coping skills and stress tolerance. This represents the optimal window for introducing challenging stress management techniques and building psychological resilience.

### Chronic stress identification prevents long-term health consequences

**Prolonged HRV suppression** over weeks to months, combined with sleep disruption patterns and altered activity rhythms, provides early warning signals for chronic stress states. Digital biomarkers including consistently low HRV, reduced sleep efficiency, and altered circadian patterns enable intervention before clinical symptoms develop.

**Personalized alert systems** notify users when chronic stress indicators exceed individual thresholds, triggering recommendations for professional support, lifestyle modifications, or medical consultation. Integration with healthcare providers enables seamless transition from self-management to clinical care when appropriate.

### Sleep-stress-performance interactions guide comprehensive interventions

**Sleep quality emerges as the strongest predictor** of next-day stress resilience in university studies using Oura Ring data. Women demonstrate distinct heart rate curves during sleep, with stress-related delayed heart rate drops providing measurable indicators of stress impact on recovery processes.

**Performance optimization protocols** adjust daily workloads and demands based on sleep-stress interaction patterns. Recovery recommendations emphasize sleep hygiene when stress indicators suggest compromised resilience, while stress management intensifies when sleep quality deteriorates.

## Implementation considerations for evidence-based women's health apps

**Multi-sensor data fusion approaches** combining temperature, HRV, and activity data achieve significantly higher accuracy (87% versus 72% for single metrics) for cycle tracking and health optimization. Individual baseline establishment requires minimum 2-3 complete cycles for naturally cycling women, with extended 6-month periods needed for irregular cycles or perimenopausal women.

### Privacy and security considerations address unique vulnerabilities

**Enhanced data protection standards** are essential for reproductive health data, with 20 of 23 popular femtech apps currently sharing data with third parties without clear user consent. The post-Dobbs legal landscape increases risks of data misuse, requiring end-to-end encryption, local processing capabilities, and granular user controls for data deletion and sharing.

**Clinical integration opportunities** exist through shareable reports for healthcare providers, automated alerts for potential sleep disorders or chronic stress requiring medical attention, and consideration of medication interactions with wearable metrics. FDA-cleared features demonstrate higher accuracy than general wellness metrics, suggesting pathways for clinical-grade applications.

### Algorithm development priorities ensure effectiveness and equity

**Transfer learning approaches** adapt general models to individual users with limited personal data, while federated learning enables training across diverse populations while preserving privacy. Continual learning systems update models as user physiology and behavior patterns change over time.

**Bias detection and correction** requires systematic evaluation of algorithmic performance across demographic groups, with current validation studies skewing toward young, affluent, technology-proficient users. Representative validation across age ranges, ethnicities, and health conditions ensures equitable outcomes.

The convergence of advancing sensor technology, sophisticated AI/ML approaches, and growing understanding of women's physiological patterns creates unprecedented opportunities for evidence-based, personalized health optimization systems that truly account for the complexity of female physiology across the lifespan."""
        # Create the prompt
        prompt = f"""You are a health and performance expert analyzing Oura Ring data for a client. Please provide personalized, science-backed advice based on the data analysis and user profile below.

## User Profile
Name: {self.user_metadata.get('name', 'User')}
Age: {self.user_metadata.get('age', 'Not specified')}
Goals: {self.user_metadata.get('goals', 'General health')}

## Data Dictionary Context
The following data comes from an Oura Ring, which tracks various health metrics:

{json.dumps(self.data_dictionary, indent=2)}

## Health Data Analysis
{stats_summary}

## Instructions
Based on this data analysis and the user's profile, provide comprehensive, actionable advice. 
Your advice should be specific to women. Use the following markdown scientific report on research for women's health to guide you.
{md_report}

Structure your response with the following sections:

### Behavioral Recommendations
Provide specific lifestyle and daily habit recommendations based on the data patterns observed.

### Exercise Recommendations  
Suggest specific workout types, intensities, timing, and recovery protocols based on the readiness, activity, and cardiovascular data.

### Nutrition Recommendations
Recommend dietary strategies that align with the observed sleep, recovery, and performance patterns.

### Supplementation Recommendations
Suggest evidence-based supplements that could support the user's goals and address any deficiencies suggested by the data.

Make sure all recommendations are:
- Science-backed with brief explanations of the reasoning
- Specific and actionable
- Tailored to the user's age, goals, and data patterns
- Realistic for implementation
- take into account the menstrual cycle

Focus on the most impactful recommendations rather than overwhelming with too many suggestions.
begin response with 'Emma's Personalized Health Advice:' and ensure the response is concise yet comprehensive."""

        return prompt

    def generate_personalized_advice(self) -> str:
        """
        Generate personalized health advice using Claude API based on the analysis and user metadata.
        
        Returns:
            String containing personalized advice
        """
        if not self.claude_client:
            return "Claude API client not available. Please set ANTHROPIC_API_KEY environment variable."
        
        if not self.summary_stats:
            return "No analysis data available. Please run analyze_all_datasets() first."
        
        # Get the prompt using the new method
        prompt = self.get_analysis_prompt()

        try:
            # Call Claude API
            response = self.claude_client.messages.create(
                model="claude-3-5-sonnet-20241022",
                max_tokens=4000,
                messages=[
                    {
                        "role": "user",
                        "content": prompt
                    }
                ]
            )
            with open("claude_response.json", "w") as f:
                json.dump(response.content[0].text, f)
            return response.content[0].text
            
        except Exception as e:
            return f"Error generating advice: {str(e)}"
    
    def generate_personalized_advice_structured(self) -> dict:
        """
        Generate personalized health advice using Claude API with structured JSON output.
        
        Returns:
            Dictionary containing structured advice with sections for behavioral, exercise, nutrition, and supplementation recommendations
        """
        if not self.claude_client:
            return {"error": "Claude API client not available. Please set ANTHROPIC_API_KEY environment variable."}
        
        if not self.summary_stats:
            return {"error": "No analysis data available. Please run analyze_all_datasets() first."}
        
        # Get the base prompt and modify for JSON output
        base_prompt = self.get_analysis_prompt()
        
        # Add JSON structure requirements
        json_prompt = base_prompt + """

Please provide your response in the following JSON format:

{
  "title": "Emma's Personalized Health Advice",
  "user_profile": {
    "name": "Emma",
    "age": 26,
    "focus_areas": ["sleep optimization", "recovery", "cardiovascular health"]
  },
  "sections": {
    "behavioral": {
      "title": "Behavioral Recommendations",
      "icon": "🧠",
      "recommendations": [
        {
          "title": "Recommendation title",
          "description": "Detailed description of the recommendation",
          "reasoning": "Brief scientific reasoning behind this recommendation",
          "actionable_steps": ["Step 1", "Step 2", "Step 3"]
        }
      ]
    },
    "exercise": {
      "title": "Exercise Recommendations", 
      "icon": "💪",
      "recommendations": [
        {
          "title": "Recommendation title",
          "description": "Detailed description of the recommendation",
          "reasoning": "Brief scientific reasoning behind this recommendation",
          "actionable_steps": ["Step 1", "Step 2", "Step 3"]
        }
      ]
    },
    "nutrition": {
      "title": "Nutrition Recommendations",
      "icon": "🥗", 
      "recommendations": [
        {
          "title": "Recommendation title",
          "description": "Detailed description of the recommendation",
          "reasoning": "Brief scientific reasoning behind this recommendation",
          "actionable_steps": ["Step 1", "Step 2", "Step 3"]
        }
      ]
    },
    "supplementation": {
      "title": "Supplementation Recommendations",
      "icon": "💊",
      "recommendations": [
        {
          "title": "Recommendation title", 
          "description": "Detailed description of the recommendation",
          "reasoning": "Brief scientific reasoning behind this recommendation",
          "actionable_steps": ["Step 1", "Step 2", "Step 3"]
        }
      ]
    }
  }
}

Provide 2-4 specific, actionable recommendations per section. Make sure all recommendations are science-backed and personalized to Emma's data patterns."""

        try:
            # Call Claude API with JSON mode
            response = self.claude_client.messages.create(
                model="claude-3-5-sonnet-20241022",
                max_tokens=4000,
                messages=[
                    {
                        "role": "user",
                        "content": json_prompt
                    }
                ]
            )
            
            # Parse the JSON response
            advice_text = response.content[0].text
            
            # Save raw response for debugging
            with open("claude_response.json", "w") as f:
                json.dump(advice_text, f)
            
            # Try to parse as JSON
            try:
                # Clean the response text more thoroughly
                cleaned_text = advice_text.strip()
                
                # Remove markdown formatting
                if cleaned_text.startswith('```json'):
                    cleaned_text = cleaned_text[7:]
                elif cleaned_text.startswith('```'):
                    cleaned_text = cleaned_text[3:]
                    
                if cleaned_text.endswith('```'):
                    cleaned_text = cleaned_text[:-3]
                
                cleaned_text = cleaned_text.strip()
                
                # Find JSON object boundaries
                start_idx = cleaned_text.find('{')
                end_idx = cleaned_text.rfind('}')
                
                if start_idx != -1 and end_idx != -1 and end_idx > start_idx:
                    cleaned_text = cleaned_text[start_idx:end_idx+1]
                
                structured_advice = json.loads(cleaned_text)
                
                # Save structured response
                with open("claude_structured_response.json", "w") as f:
                    json.dump(structured_advice, f, indent=2)
                
                return structured_advice
                
            except json.JSONDecodeError as json_error:
                print(f"JSON parsing error: {json_error}")
                print(f"Raw response: {advice_text[:200]}...")
                # Fallback to text response
                return {"error": f"Failed to parse JSON response: {str(json_error)}", "raw_response": advice_text}
            
        except Exception as e:
            return {"error": f"Error generating advice: {str(e)}"}
    
    def generate_daily_advice_structured(self) -> dict:
        """
        Generate structured daily advice using Claude API with JSON output.
        
        Returns:
            Dictionary containing structured daily programs for movement, mindfulness, and nutrition
        """
        if not self.claude_client:
            return {"error": "Claude API client not available. Please set ANTHROPIC_API_KEY environment variable."}
        
        # Load the previous Claude response from file
        try:
            with open("claude_response.json", "r") as f:
                previous_response = json.load(f)
        except Exception as e:
            return {"error": f"Failed to load previous response: {e}"}
        
        # Generate structured daily advice in card format with scientific citations
        json_prompt = f"""Based on the existing advice that you have on Emma and her metadata:
{previous_response}

IMPORTANT: You must respond ONLY with valid JSON. Do not include any text before or after the JSON. Do not use markdown formatting. Respond with pure JSON only.

Please provide 3 different daily programmes that will be displayed as flippable cards.
The daily programmes should pertain to one activity only, be that one full workout, one breating exercise routine or one day's meal plan.
The meal plan should only contain breakfast, lunch, dinner and 1 snack.

 Each card should have actionable items on the front and scientific backing on the back. Use this exact JSON format:

{{
  "title": "Emma's Daily Health Programs",
  "cards": [
    {{
      "title": "Movement",
      "items": [
      "Burpees 60 seconds",
      "Shoulder taps 60 seconds", 
      "V Ups 60 seconds",
      "30 Second rest",
      "Repeat x5"
        
      ],
      "description": "2-3 sentence explanation of why this movement program works specifically for Emma based on her Oura data patterns, menstrual cycle phase, and health goals. Mention specific benefits for performance optimization and recovery.",
      "sources": [
        {{"name": "High-Intensity Interval Training in Women", "url": "https://pubmed.ncbi.nlm.nih.gov/29765853/"}},
        {{"name": "Exercise and Menstrual Cycle Performance", "url": "https://doi.org/10.1249/MSS.0000000000001946"}}
      ]
    }},
    {{
      "title": "Mindfulness",
      "items": [
       "The 4-2-8 Breathing Method",
       "Inhale: Breathe in slowly and deeply through your nose for a count of four."
"Hold: Hold your breath for a count of two."
"Exhale: Exhale slowly and completely through your mouth for a count of one."
"Repeat: Repeat this cycle for a set number of repetitions, usually between 5-10 minutes, or until you feel calmer."
      ],
      "description": "2-3 sentence explanation of why this mindfulness program works specifically for Emma based on her stress patterns, HRV data, and cycle phase. Mention benefits for stress resilience and sleep optimization.",
      "sources": [
        {{"name": "Breathing Techniques for Stress Reduction", "url": "https://pubmed.ncbi.nlm.nih.gov/31376606/"}},
        {{"name": "HRV Biofeedback and Autonomic Function", "url": "https://doi.org/10.1016/j.brat.2019.103432"}}
      ]
    }},
    {{
      "title": "Nutrition",
      "items": [
        "BREAKFAST: Granola with Greek Yogurt and blueberries and honey",
        "LUNCH: Salmon and quinoa salad with kale", 
        "DINNER: Paprika chicken with brown rice and broccoli",
        "SNACK: Mixed nuts and apple slices"
      ],
      "description": "2-3 sentence explanation of why this nutrition program works specifically for Emma based on her activity levels, recovery patterns, and cycle phase. Mention benefits for performance and hormonal balance.",
      "sources": [
        {{"name": "Nutrition Timing for Athletic Performance", "url": "https://pubmed.ncbi.nlm.nih.gov/32034384/"}},
        {{"name": "Protein Requirements for Female Athletes", "url": "https://doi.org/10.1093/advances/nmz090"}}
      ]
    }}
  ]
}}

CRITICAL: 
- Each item should be part of a programme that you are giving the user. Each item should therefore have enough detail for the user to carry out the activity without any outside help.
- For Movement cards: Do NOT include warm-ups or cool-downs. Focus only on the main exercise routine.
- For Nutrition cards: ALWAYS structure as "BREAKFAST: ...", "LUNCH: ...", "DINNER: ...", "SNACK: ..." for easy parsing into subheadings.
- Descriptions should reference Emma's actual data patterns and be personalized
- Sources should be objects with "name" (descriptive paper title) and "url" (actual PubMed/DOI link) properties
- Your response must be valid JSON only. No explanatory text. No markdown. Just JSON."""

        try:
            # Call Claude API with JSON mode
            response = self.claude_client.messages.create(
                model="claude-3-5-sonnet-20241022",
                max_tokens=3000,
                messages=[
                    {
                        "role": "user",
                        "content": json_prompt
                    }
                ]
            )
            
            # Parse the JSON response
            advice_text = response.content[0].text
            
            # Try to parse as JSON
            try:
                # Clean the response text more thoroughly
                cleaned_text = advice_text.strip()
                
                # Remove markdown formatting
                if cleaned_text.startswith('```json'):
                    cleaned_text = cleaned_text[7:]
                elif cleaned_text.startswith('```'):
                    cleaned_text = cleaned_text[3:]
                    
                if cleaned_text.endswith('```'):
                    cleaned_text = cleaned_text[:-3]
                
                cleaned_text = cleaned_text.strip()
                
                # Find JSON object boundaries
                start_idx = cleaned_text.find('{')
                end_idx = cleaned_text.rfind('}')
                
                if start_idx != -1 and end_idx != -1 and end_idx > start_idx:
                    cleaned_text = cleaned_text[start_idx:end_idx+1]
                
                structured_advice = json.loads(cleaned_text)
                
                # Save structured response
                with open("claude_daily_structured_response.json", "w") as f:
                    json.dump(structured_advice, f, indent=2)
                
                return structured_advice
                
            except json.JSONDecodeError as json_error:
                print(f"JSON parsing error: {json_error}")
                print(f"Raw response: {advice_text[:200]}...")
                # Fallback to text response
                return {"error": f"Failed to parse JSON response: {str(json_error)}", "raw_response": advice_text}
            
        except Exception as e:
            return {"error": f"Error generating daily advice: {str(e)}"}
    
    def generate_daily_advice(self)->None:
            # Load the previous Claude response from file
            try:
                with open("claude_response.json", "r") as f:
                    previous_response = json.load(f)
                print("Loaded previous Claude response from claude_response.json:")
                print(previous_response)
            except Exception as e:
                print(f"Failed to load previous response: {e}")
            
            # Generate a new advice response using an empty prompt
            if not self.claude_client:
                print("Claude API client not available. Please set ANTHROPIC_API_KEY environment variable.")
                return
            prompt = f"""Based on the existing advice that you have on emma and her metadata:
            {previous_response}.
            
            Suggest 3 different daily programmes. They should be structured as:
            ## Movment
            Suggest a movement programme for today based on the health advice.
            Give one workout/activity only and give details on it + why it's good
            ## Mindfulness
            Suggest a mindfulness programme for today based on the health advice.
            Give one workout/activity only and give details on it + why it's good
            ## Nutrition
            Suggest a nutrition programme for today based on the health advice.
            Give actual meal ideas and details on why they are good for the user.
            The meal plan should only contain breakfast, lunch, dinner and 1 snack. Do not give pre or post workout meals or any other meals.

            Only do one programme, assume user is in early stage of cycle.
            In all cases, explain why it is good, relevant to the user's own data!
            Begin response with: Here are some ideas for you to try today to achive your goals

            
            """


            try:
                response = self.claude_client.messages.create(
                    model="claude-3-5-sonnet-20241022",
                    max_tokens=4000,
                    messages=[
                        {"role": "user", "content": prompt}
                    ]
                )
                new_response = response.content[0].text
                return new_response
            except Exception as e:
                print(f"Error generating new advice: {e}")

    def print_daily_advice(self) -> None:
        print("Generating daily advice...")
        daily_response = self.daily_advice()
        print(daily_response)
        # Save daily advice to file with timestamp
        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        filename = f"daily_advice_{self.user_metadata.get('name', 'user')}_{timestamp}.md"
        advice_path = Path(__file__).parent / "static" / filename

        try:
            with open(advice_path, 'w') as f:
                f.write(f"# Daily Health Advice for {self.user_metadata.get('name', 'User')}\n")
                f.write(f"Generated on: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}\n\n")
                f.write(daily_response)
                print(f"\n✓ Daily advice saved to: {advice_path}")
        except Exception as e:
            print(f"\nWarning: Could not save daily advice to file: {e}")

    def print_personalized_advice(self) -> None:
        """Generate and print personalized advice."""
        print("Generating personalized health advice...")
        print("=" * 60)
        
        advice = self.generate_personalized_advice()
        print(advice)
        
        # Save advice to file with timestamp
        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        filename = f"health_advice_{self.user_metadata.get('name', 'user')}_{timestamp}.md"
        advice_path = Path(__file__).parent / "static" / filename
        
        try:
            with open(advice_path, 'w') as f:
                f.write(f"# Health Advice for {self.user_metadata.get('name', 'User')}\n")
                f.write(f"Generated on: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}\n\n")
                f.write(advice)
            print(f"\n✓ Advice saved to: {advice_path}")
        except Exception as e:
            print(f"\nWarning: Could not save advice to file: {e}")