import streamlit as st

def scroll_up():
        js_scroll_up = '''
<script>
    var body = window.parent.document.querySelector(".main");
    body.scrollTop = 0;
</script>
'''
        st.components.v1.html(js_scroll_up, height=0, width=0)
