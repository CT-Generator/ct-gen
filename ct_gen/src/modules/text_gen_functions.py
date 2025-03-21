from openai import OpenAI

# Moderation endpoint
def moderate_text(text, client=None):
    try:
        if client is None:
            from ct_gen.src.modules.authentication import load_secrets
            secrets = load_secrets()
            client = OpenAI(api_key=secrets["openai"]["api_key"])
            
        response = client.moderations.create(
            input=text
        )
        
        if any(result.flagged for result in response.results):
            return False, "Content is not appropriate."
        return True, "Content is appropriate."

    except Exception as e:
        print(f"Error in moderation: {str(e)}")
        return False, "Failed to moderate content."
