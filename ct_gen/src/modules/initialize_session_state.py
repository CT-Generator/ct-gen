import streamlit as st


def initalize_session_state_dict():
    
    st.session_state["model_name"] = "gpt-3.5-turbo"
    
    if "prompt" not in st.session_state:
        st.session_state["prompt"] = ""
    
    if "page_number" not in st.session_state:
        st.session_state["page_number"] = 1
        
    
    
        