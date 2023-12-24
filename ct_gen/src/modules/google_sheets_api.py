import streamlit as st
import gspread
import pandas as pd
import os
import toml
from oauth2client.service_account import ServiceAccountCredentials



# @st.cache_data(show_spinner=False)
# def load_google_sheets_data(worksheet_name):
    
#     secrets = toml.load(".streamlit/secrets.toml")
    
#     scope = ['https://spreadsheets.google.com/feeds', 'https://www.googleapis.com/auth/drive']
#     credentials = ServiceAccountCredentials.from_json_keyfile_dict(secrets['google_sheets'], scope)
    
#     # Authenticate and access the Google Sheets API
#     gc = gspread.authorize(credentials)
    
#     # Load the Google Sheets data
#     spreadsheet_url = secrets['google_sheets']['spreadsheet']
#     sheet = gc.open_by_url(spreadsheet_url).worksheet(worksheet_name)
#     data = sheet.get_all_values()
    
#     # Convert the data to a DataFrame
#     df = pd.DataFrame(data[1:], columns=data[0])
#     return df.loc[::-1]


@st.cache_data(show_spinner=False)
def connect_to_google_sheets_data():
    
    secrets = toml.load(".streamlit/secrets.toml")
    
    scope = ['https://spreadsheets.google.com/feeds', 'https://www.googleapis.com/auth/drive']
    credentials = ServiceAccountCredentials.from_json_keyfile_dict(secrets['google_sheets'], scope)
    
    # Authenticate and access the Google Sheets API
    gc = gspread.authorize(credentials)
    
    # Load the Google Sheets data
    spreadsheet_url = secrets['google_sheets']['spreadsheet']
    sheet = gc.open_by_url(spreadsheet_url) #.worksheet(worksheet_name)
    st.session_state["sheet"] = sheet
    return sheet
    
    
    # data = sheet.get_all_values()
    
    # # Convert the data to a DataFrame
    # df = pd.DataFrame(data[1:], columns=data[0])
    # return df.loc[::-1]
    
def load_sheets_data(sheet, worksheet_name):
    sheet = st.session_state["sheet"].worksheet(worksheet_name)
    data = sheet.get_all_values()
    
    # Convert the data to a DataFrame
    df = pd.DataFrame(data[1:], columns=data[0])
    return df.loc[::-1]
    
def insert_row_to_sheet(sheet, worksheet_name, row):
    sheet = st.session_state["sheet"].worksheet(worksheet_name)
    sheet.append_row(row)
    
    