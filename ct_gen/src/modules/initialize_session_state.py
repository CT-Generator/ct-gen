import streamlit as st
import openai
from ct_gen.src.modules.google_sheets_api import connect_to_google_sheets_data

def initalize_session_state_dict():
    # Initialize OpenAI API connection
    openai.api_key = st.secrets["openai"]["api_key"]
    
    # functional 
    st.session_state["model_name"] = "gpt-4"
    
    if "change_tracker" not in st.session_state:
        st.session_state["change_tracker"] = 0
    if "page_number" not in st.session_state:
        st.session_state["page_number"] = 1
    if "rating" not in st.session_state:
        st.session_state["rating"] = None
    if "ct_saved" not in st.session_state:
        st.session_state["ct_saved"] = False

        
    # news
    if "news_name" not in st.session_state:
        st.session_state["news_name"] = ""
    if "news_summary" not in st.session_state:
        st.session_state["news_summary"] = ""
    if "news_img" not in st.session_state:
        st.session_state["news_img"] = None
    if "news_caption" not in st.session_state:
        st.session_state["news_caption"] = None
    
    # culprits
    if "culprits_name" not in st.session_state:
        st.session_state["culprits_name"] = ""
    if "culprits_summary" not in st.session_state:
        st.session_state["culprits_summary"] = ""
    if "culprits_img" not in st.session_state:
        st.session_state["culprits_img"] = None
    if "culprits_caption" not in st.session_state:
        st.session_state["culprits_caption"] = None
    
    # motives
    if "motives_name" not in st.session_state:
        st.session_state["motives_name"] = ""
    if "motives_summary" not in st.session_state:
        st.session_state["motives_summary"] = ""
    if "motives_img" not in st.session_state:
        st.session_state["motives_img"] = None
    if "motives_caption" not in st.session_state:
        st.session_state["motives_caption"] = None
    
    # output
    if "prompt" not in st.session_state:
        st.session_state["prompt"] = ""
    if 'conspiracy_theory' not in st.session_state:
        st.session_state.conspiracy_theory = ""
    if 'conspiracy_explanation' not in st.session_state:
        st.session_state["conspiracy_explanation"] = ""