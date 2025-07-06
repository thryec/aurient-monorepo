import streamlit as st
import pandas as pd
import numpy as np
import matplotlib.pyplot as plt
import seaborn as sns
import plotly.express as px
import plotly.graph_objects as go
from plotly.subplots import make_subplots
import json
import os
from pathlib import Path
import sys
from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv()

# Add current directory to path for imports
sys.path.append(str(Path(__file__).parent))

from oura_analysis import OuraAnalysis

# Page configuration
st.set_page_config(
    page_title="Oura Health Analytics Dashboard",
    page_icon="💍",
    layout="wide",
    initial_sidebar_state="expanded"
)

# Custom CSS for better styling
st.markdown("""
<style>
    .main-header {
        font-size: 2.5rem;
        color: #1f77b4;
        text-align: center;
        margin-bottom: 2rem;
    }
    .dataset-metric {
        background-color: #f0f2f6;
        padding: 1rem;
        border-radius: 0.5rem;
        margin: 0.5rem 0;
    }
    .insight-box {
        background-color: #e6f3ff;
        padding: 1.5rem;
        border-radius: 0.5rem;
        border-left: 4px solid #1f77b4;
        margin: 1rem 0;
    }
</style>
""", unsafe_allow_html=True)

# @st.cache_data
def load_oura_data():
    """Load and cache the Oura data."""
    emma_metadata = {
        'name': 'Emma',
        'age': 26,
        'goals': 'performance',
        'activity_level': 'high',
        'focus_areas': ['sleep optimization', 'recovery', 'cardiovascular health']
    }
    
    analyzer = OuraAnalysis(user_metadata=emma_metadata)
    analyzer.load_from_cache('data/')
    analyzer.analyze_all_datasets()
    
    return analyzer

def create_interactive_plot(df, dataset_name, numeric_cols):
    """Create interactive Plotly visualizations."""
    if not numeric_cols:
        fig = go.Figure()
        fig.add_annotation(
            text=f"No numeric data available for {dataset_name}",
            xref="paper", yref="paper",
            x=0.5, y=0.5, showarrow=False,
            font=dict(size=16)
        )
        fig.update_layout(
            title=f"{dataset_name.replace('_', ' ').title()} - No Numeric Data",
            height=400
        )
        return fig
    
    # Create subplots based on number of numeric columns
    n_cols = min(len(numeric_cols), 2)
    n_rows = (len(numeric_cols) + n_cols - 1) // n_cols
    
    subplot_titles = [col.replace('_', ' ').title() for col in numeric_cols]
    
    fig = make_subplots(
        rows=n_rows, cols=n_cols,
        subplot_titles=subplot_titles,
        vertical_spacing=0.1,
        horizontal_spacing=0.1
    )
    
    colors = px.colors.qualitative.Set3
    
    for i, col in enumerate(numeric_cols):
        row = (i // n_cols) + 1
        col_idx = (i % n_cols) + 1
        
        # Skip columns with all missing values
        if df[col].dropna().empty:
            continue
        
        # Create histogram
        fig.add_trace(
            go.Histogram(
                x=df[col].dropna(),
                name=col,
                marker_color=colors[i % len(colors)],
                opacity=0.7,
                showlegend=False
            ),
            row=row, col=col_idx
        )
        
        # Add mean line
        mean_val = df[col].mean()
        if not np.isnan(mean_val):
            fig.add_vline(
                x=mean_val,
                line_dash="dash",
                line_color="red",
                annotation_text=f"Mean: {mean_val:.2f}",
                row=row, col=col_idx
            )
    
    fig.update_layout(
        title=f"{dataset_name.replace('_', ' ').title()} Distribution Analysis",
        height=300 * n_rows,
        showlegend=False
    )
    
    return fig

def display_dataset_tab(analyzer, dataset_name):
    """Display content for a dataset tab."""
    if dataset_name not in analyzer.health_data:
        st.error(f"Dataset {dataset_name} not found!")
        return
    
    df = analyzer.health_data[dataset_name]
    stats = analyzer.get_summary_stats(dataset_name)
    
    # Dataset overview
    col1, col2, col3, col4 = st.columns(4)
    
    with col1:
        st.metric("Total Records", f"{df.shape[0]:,}")
    
    with col2:
        st.metric("Features", df.shape[1])
    
    with col3:
        missing_total = sum(stats['missing_values'].values()) if stats else 0
        st.metric("Missing Values", missing_total)
    
    with col4:
        numeric_count = len(stats['numeric_summary']) if stats and stats['numeric_summary'] else 0
        st.metric("Numeric Features", numeric_count)
    
    # Data preview
    st.subheader("📊 Data Preview")
    st.dataframe(df.head(10), use_container_width=True)
    
    # Statistics
    if stats and stats['numeric_summary']:
        st.subheader("📈 Statistical Summary")
        
        # Convert to DataFrame for better display
        stats_df = pd.DataFrame(stats['numeric_summary']).round(3)
        st.dataframe(stats_df, use_container_width=True)
        
        # Interactive plots
        st.subheader("📉 Interactive Visualizations")
        numeric_cols = list(stats['numeric_summary'].keys())
        
        if len(numeric_cols) > 0:
            fig = create_interactive_plot(df, dataset_name, numeric_cols)
            st.plotly_chart(fig, use_container_width=True)
        
        # Correlation matrix if applicable
        if len(numeric_cols) > 1:
            st.subheader("🔗 Correlation Matrix")
            corr_data = df[numeric_cols].corr()
            
            fig_corr = px.imshow(
                corr_data,
                title=f"{dataset_name.replace('_', ' ').title()} - Feature Correlations",
                color_continuous_scale="RdBu_r",
                aspect="auto"
            )
            st.plotly_chart(fig_corr, use_container_width=True)
    
    # Data quality information
    st.subheader("🔍 Data Quality")
    
    col1, col2 = st.columns(2)
    
    with col1:
        st.write("**Data Types:**")
        dtype_df = pd.DataFrame({
            'Column': df.dtypes.index,
            'Type': df.dtypes.values.astype(str)
        })
        st.dataframe(dtype_df, use_container_width=True, hide_index=True)
    
    with col2:
        if stats:
            st.write("**Missing Values:**")
            missing_df = pd.DataFrame({
                'Column': list(stats['missing_values'].keys()),
                'Missing Count': list(stats['missing_values'].values())
            })
            missing_df = missing_df[missing_df['Missing Count'] > 0]
            
            if len(missing_df) > 0:
                st.dataframe(missing_df, use_container_width=True, hide_index=True)
            else:
                st.success("No missing values! ✅")

def main():
    """Main Streamlit app function."""
    # App header
    st.markdown('<h1 class="main-header">💍 Oura Health Analytics Dashboard</h1>', 
                unsafe_allow_html=True)
    
    # Sidebar
    st.sidebar.title("🎛️ Controls")
    st.sidebar.markdown("---")
    
    # Load data with progress indicator
    with st.spinner("Loading Oura health data..."):
        try:
            analyzer = load_oura_data()
            st.sidebar.success(f"✅ Loaded {len(analyzer.health_data)} datasets")
        except Exception as e:
            st.error(f"Error loading data: {str(e)}")
            st.stop()
    
    # User profile in sidebar
    st.sidebar.subheader("👤 User Profile")
    for key, value in analyzer.user_metadata.items():
        st.sidebar.text(f"{key.replace('_', ' ').title()}: {value}")
    
    # Dataset selection
    st.sidebar.markdown("---")
    st.sidebar.subheader("📊 Available Datasets")
    for name, df in analyzer.health_data.items():
        st.sidebar.text(f"• {name}: {df.shape[0]} records")
    
    # Main content area with tabs
    tab_names = ["🤖 AI Insights"] + [f"📊 {name.replace('_', ' ').title()}" 
                                      for name in analyzer.health_data.keys()]
    
    tabs = st.tabs(tab_names)
    
    # AI Insights tab
    with tabs[0]:
        st.header("🤖 AI-Powered Health Insights")
        
        # Create sub-tabs for insights and prompt
        insight_tabs = st.tabs(["💡 Generated Insights", "Daily Insights", "📋 Previous Insights"])
        
        # Generated Insights tab
        with insight_tabs[0]:
            # Check for API key
            api_key = os.getenv("ANTHROPIC_API_KEY")
            
            if not api_key:
                st.warning("""
                ⚠️ **Claude API Key Required**
                
                To generate AI insights, please set your Anthropic API key:
                ```bash
                export ANTHROPIC_API_KEY='your-api-key-here'
                ```
                
                Then restart the Streamlit app.
                """)
            else:
                if st.button("🔮 Generate AI Health Insights", type="primary"):
                    with st.spinner("Generating personalized health insights..."):
                        try:
                            advice = analyzer.generate_personalized_advice()
                            
                            st.markdown('<div class="insight-box">', unsafe_allow_html=True)
                            st.markdown(advice)
                            st.markdown('</div>', unsafe_allow_html=True)
                            
                            # Option to download advice
                            st.download_button(
                                label="📥 Download Health Insights",
                                data=advice,
                                file_name=f"health_insights_{analyzer.user_metadata['name']}.md",
                                mime="text/markdown"
                            )
                            
                        except Exception as e:
                            st.error(f"Error generating insights: {str(e)}")
        with insight_tabs[1]:
            with insight_tabs[1]:
                st.header("📅 Daily Insights")
                api_key = os.getenv("ANTHROPIC_API_KEY")

                if not api_key:
                    st.warning(
                        "⚠️ **Claude API Key Required**\n\n"
                        "To generate AI insights, please set your Anthropic API key:\n"
                        "```bash\n"
                        "export ANTHROPIC_API_KEY='your-api-key-here'\n"
                        "```\n"
                        "Then restart the Streamlit app."
                    )
                else:
                    if st.button("🔮 Generate Daily Insights", type="primary"):
                        with st.spinner("Generating daily health insights..."):
                            try:
                                advice = analyzer.generate_daily_advice()

                                st.markdown('<div class="insight-box">', unsafe_allow_html=True)
                                st.markdown(advice)
                                st.markdown('</div>', unsafe_allow_html=True)

                                st.download_button(
                                    label="📥 Download Daily Insights",
                                    data=advice,
                                    file_name=f"daily_insights_{analyzer.user_metadata['name']}.md",
                                    mime="text/markdown"
                                )
                            except Exception as e:
                                st.error(f"Error generating insights: {str(e)}")
        # Analysis Prompt tab
        # with insight_tabs[1]:
        #     st.subheader("📝 Claude Analysis Prompt")
        #     st.write("""
        #     This shows the exact prompt that will be sent to Claude AI for analysis. 
        #     It includes your user profile, the data dictionary context, and summary statistics from your health data.
        #     """)
            
        #     try:
        #         prompt = analyzer.get_analysis_prompt()
                
        #         # Display prompt in an expandable section
        #         with st.expander("🔍 View Complete Prompt", expanded=False):
        #             st.code(prompt, language="markdown")
                
        #         # Show prompt statistics
        #         col1, col2, col3 = st.columns(3)
        #         with col1:
        #             st.metric("Total Characters", f"{len(prompt):,}")
        #         with col2:
        #             st.metric("Word Count", f"{len(prompt.split()):,}")
        #         with col3:
        #             st.metric("Lines", f"{prompt.count(chr(10)) + 1:,}")
                
        #         # Option to download prompt
        #         st.download_button(
        #             label="📥 Download Analysis Prompt",
        #             data=prompt,
        #             file_name=f"analysis_prompt_{analyzer.user_metadata['name']}.md",
        #             mime="text/markdown"
        #         )
                
        #         # Show key sections of the prompt
        #         st.subheader("📋 Prompt Structure")
                
        #         sections = [
        #             ("👤 User Profile", "Contains name, age, goals, and other metadata"),
        #             ("📖 Data Dictionary", "Explains what each Oura Ring metric means"),
        #             ("📊 Health Data Analysis", "Summary statistics from your health data"),
        #             ("🎯 Instructions", "Specific guidelines for generating recommendations")
        #         ]
                
        #         for section_name, description in sections:
        #             with st.expander(f"{section_name}"):
        #                 st.write(description)
        #                 if "User Profile" in section_name:
        #                     st.json(analyzer.user_metadata)
        #                 elif "Data Analysis" in section_name:
        #                     st.write("Summary statistics for each dataset:")
        #                     for dataset in analyzer.summary_stats.keys():
        #                         stats = analyzer.get_summary_stats(dataset)
        #                         st.write(f"• **{dataset}**: {stats['shape'][0]} records, {len(stats['columns'])} features")
                
        #     except Exception as e:
        #         st.error(f"Error generating prompt: {str(e)}")
        
        # Previous Insights tab
        with insight_tabs[2]:
            st.subheader("📋 Previous Health Insights")
            
            # Display existing advice files if any
            static_dir = Path(__file__).parent / "static"
            if static_dir.exists():
                advice_files = list(static_dir.glob("health_advice_*.md"))
                if advice_files:
                    selected_file = st.selectbox(
                        "Select previous insights to view:",
                        advice_files,
                        format_func=lambda x: x.name
                    )
                    
                    if selected_file:
                        try:
                            with open(selected_file, 'r') as f:
                                content = f.read()
                            
                            # Show file info
                            file_stats = selected_file.stat()
                            col1, col2 = st.columns(2)
                            with col1:
                                st.write(f"**Created:** {file_stats.st_mtime}")
                            with col2:
                                st.write(f"**Size:** {file_stats.st_size:,} bytes")
                            
                            st.markdown("---")
                            st.markdown(content)
                            
                            # Download option
                            st.download_button(
                                label="📥 Download This Insight",
                                data=content,
                                file_name=selected_file.name,
                                mime="text/markdown"
                            )
                            
                        except Exception as e:
                            st.error(f"Error reading file: {e}")
                else:
                    st.info("No previous insights found. Generate some insights first!")
            else:
                st.info("Static directory not found. Generate some insights first!")
    
    # Dataset tabs
    for i, dataset_name in enumerate(analyzer.health_data.keys(), 1):
        with tabs[i]:
            display_dataset_tab(analyzer, dataset_name)
    
    # Footer
    st.markdown("---")
    st.markdown("""
    <div style='text-align: center; color: #666; padding: 2rem;'>
        <p>💍 Oura Health Analytics Dashboard | Built with Streamlit & Claude AI</p>
        <p>Data spans from 2023-2025 | {total_records:,} total health records analyzed</p>
    </div>
    """.format(
        total_records=sum(df.shape[0] for df in analyzer.health_data.values())
    ), unsafe_allow_html=True)

if __name__ == "__main__":
    main()