import streamlit as st
from ct_gen.src.modules.google_sheets_api import insert_row_to_sheet


def add_rating_buttons(sheet):

    col1, col2, col3, col4, col5, col6 = st.columns(6)

    with col3:
        # Thumbs up button
        if st.button("👍"):
            
            st.success("Thank you for the rating!")
            st.session_state["rating"] = "👍"
            row = [
                st.session_state["conspiracy_theory"],
                "👍"
            ]
            insert_row_to_sheet(sheet, "ratings", row)
            

    with col4:
        # Thumbs down button
        if st.button("👎"):
            st.error("Thank you for the rating!")
            st.session_state["rating"] = "👎"
            row = [
                st.session_state["conspiracy_theory"],
                "👎"
            ]
            insert_row_to_sheet(sheet, "ratings", row)