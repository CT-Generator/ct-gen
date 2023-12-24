import streamlit as st


def add_rating_buttons():

    col1, col2, col3, col4, col5, col6 = st.columns(6)

    with col3:
        # Thumbs up button
        if st.button("👍"):
            
            st.success("Thank you for the rating!")
            st.session_state["rating"] = "👍"

    with col4:
        # Thumbs down button
        if st.button("👎"):
            st.error("Thank you for the rating!")
            st.session_state["rating"] = "👎"