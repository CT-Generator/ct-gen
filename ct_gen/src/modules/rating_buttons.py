import streamlit as st
from ct_gen.src.modules.google_sheets_api import insert_row_to_sheet


def add_rating_buttons(ct_sheet, ratings_sheet):

    col1, col2, col3, col4, col5, col6 = st.columns(6)
    
    ct_row = [
        st.session_state["news_name"],
        st.session_state["news_summary"],
        st.session_state["culprits_name"],
        st.session_state["culprits_summary"],
        st.session_state["motives_name"],
        st.session_state["motives_summary"],
        st.session_state["prompt"],
        st.session_state["conspiracy_theory"]
    ]
    

    with col3:
        # Thumbs up button
        if st.button("👍"):
            
            
            st.session_state["rating"] = "👍"
            row = [
                st.session_state["conspiracy_theory"],
                "👍"
            ]
            insert_row_to_sheet(ratings_sheet, row)
            st.success("Thank you for the rating!")
            
            
            

    with col4:
        # Thumbs down button
        if st.button("👎"):
            
            st.session_state["rating"] = "👎"
            row = [
                st.session_state["conspiracy_theory"],
                "👎"
            ]
            insert_row_to_sheet(ratings_sheet, row)
            st.error("Thank you for the rating!")