import streamlit as st

def forward_button(col, button_text):
    if col.button(button_text):
        st.session_state["page_number"] = st.session_state["page_number"] + 1
        st.experimental_rerun()
def backward_button(col, button_text):
    if col.button(button_text):
        st.session_state["page_number"] = st.session_state["page_number"] - 1
        st.experimental_rerun()