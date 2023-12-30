import hmac
import os
import streamlit as st
import toml

# Load the secrets at the start of the app
def load_secrets():
    # Construct the full path to the secrets.toml file in the .streamlit directory
    secrets_file_path = os.path.join(".streamlit", "secrets.toml")

    # Load the secrets from the secrets.toml file
    secrets = toml.load(secrets_file_path)
    return secrets

def check_password():
    """Returns `True` if the user had the correct password."""

    def password_entered():
        """Checks whether a password entered by the user is correct."""
        if hmac.compare_digest(st.session_state["password"], st.secrets["streamlit_password"]):
            st.session_state["password_correct"] = True
            del st.session_state["password"]  # Don't store the password.
        else:
            st.session_state["password_correct"] = False

    # Return True if the passward is validated.
    if st.session_state.get("password_correct", False):
        return True

    # Show input for password.
    st.text_input(
        "Password", type="password", on_change=password_entered, key="password"
    )
    if "password_correct" in st.session_state:
        st.error("😕 Password incorrect")
    return False


