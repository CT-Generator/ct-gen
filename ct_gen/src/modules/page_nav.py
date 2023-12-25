import streamlit as st

def forward_button(col, button_text):
    if col.button(button_text):
        st.session_state["page_number"] = st.session_state["page_number"] + 1
        st.experimental_rerun()
        
def backward_button(col, button_text):
    if col.button(button_text):
        st.session_state["page_number"] = st.session_state["page_number"] - 1
        st.experimental_rerun()

# Back to start
def begin_button(col, button_text):
    if col.button(button_text):
        for key in st.session_state.keys():
            del st.session_state[key]
        st.session_state["page_number"] = st.session_state["page_number"] = 2
        st.experimental_rerun()