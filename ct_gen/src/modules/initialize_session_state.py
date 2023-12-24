import streamlit as st
import openai

def initalize_session_state_dict():
    # Initialize OpenAI API connection
    openai.api_key = st.secrets["openai"]["api_key"]
    
    # functional 
    st.session_state["model_name"] = "gpt-4"
    
    if "change_tracker" not in st.session_state:
        st.session_state["change_tracker"] = 0
    if "page_number" not in st.session_state:
        st.session_state["page_number"] = 1
        
    # news
    if "news_name" not in st.session_state:
        st.session_state["news_name"] = ""
    if "news_summary" not in st.session_state:
        st.session_state["news_summary"] = ""
    if "news_img" not in st.session_state:
        st.session_state["news_img"] = ""
    
    # culprits
    if "culprits_name" not in st.session_state:
        st.session_state["culprits_name"] = ""
    if "culprits_summary" not in st.session_state:
        st.session_state["culprits_summary"] = ""
    if "culprits_img" not in st.session_state:
        st.session_state["culprits_img"] = ""
    
    # motives
    if "motives_name" not in st.session_state:
        st.session_state["motives_name"] = ""
    if "motives_summary" not in st.session_state:
        st.session_state["motives_summary"] = ""
    if "motives_img" not in st.session_state:
        st.session_state["motives_img"] = ""
    
    # output
    if "prompt" not in st.session_state:
        st.session_state["prompt"] = ""
    if 'conspiracy_theory' not in st.session_state:
        st.session_state.conspiracy_theory = ""