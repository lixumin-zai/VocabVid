

class Win:
    def __init__(self, center, height, width):

        self.center = center
        self.height = height
        self.width = width

        self.text = None


    def add_text(self, text):
        self.text = text
        self.text.shift(self.center)

        return self.text
