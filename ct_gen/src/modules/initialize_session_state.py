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
    if 'culprits' not in st.session_state:
        st.session_state.culprits = ""
    if 'goals' not in st.session_state:
        st.session_state.goals = ""
    if 'motive_info' not in st.session_state:
        st.session_state.motive_info = ""  
    if 'conspiracy_theory' not in st.session_state:
        st.session_state.conspiracy_theory = ""
    
    
        