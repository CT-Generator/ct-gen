import openai

# Moderation endpoint
def moderate_text(text):
    try:
        response = openai.Moderation.create(
            input=text
        )
        
        if any(result['flagged'] for result in response['results']):
            return False, "Content is not appropriate."
        return True, "Content is appropriate."

    except Exception as e:
        print(f"Error in moderation: {str(e)}")
        return False, "Failed to moderate content."
