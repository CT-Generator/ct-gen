import streamlit as st
import openai


def initalize_session_state_dict():
    # Initialize OpenAI API connection
    openai.api_key = st.secrets["openai"]["api_key"]
    
    st.session_state["model_name"] = "gpt-3.5-turbo"
    
    if "prompt" not in st.session_state:
        st.session_state["prompt"] = ""
    
    if "page_number" not in st.session_state:
        st.session_state["page_number"] = 1
        
    # Initialize the user inputs and generated conspiracy theory in session state
    if 'url' not in st.session_state:
        st.session_state.url = ""
    if 'selected_version' not in st.session_state:
        st.session_state["selected_version"] = ""
    if 'selected_article_content' not in st.session_state:
        st.session_state["selected_article_content"] = ""
    if 'culprits' not in st.session_state:
        st.session_state.culprits = ""
    if 'goals' not in st.session_state:
        st.session_state.goals = ""
    if 'motive_info' not in st.session_state:
        st.session_state.motive_info = ""  
    if 'conspiracy_theory' not in st.session_state:
        st.session_state.conspiracy_theory = ""
    if "change_tracker" not in st.session_state:
        st.session_state["change_tracker"] = 0
        
    
    if "news_name" not in st.session_state:
        st.session_state["news_name"] = ""
    if "news_summary" not in st.session_state:
        st.session_state["news_summary"] = ""
    if "news_img" not in st.session_state:
        st.session_state["news_img"] = ""
    
    if "culprits_name" not in st.session_state:
        st.session_state["culprits_name"] = ""
    if "culprits_summary" not in st.session_state:
        st.session_state["culprits_summary"] = ""
    if "culprits_img" not in st.session_state:
        st.session_state["culprits_img"] = ""
        
    if "motives_name" not in st.session_state:
        st.session_state["motives_name"] = ""
    if "motives_summary" not in st.session_state:
        st.session_state["motives_summary"] = ""
    if "motives_img" not in st.session_state:
        st.session_state["motives_img"] = ""
        