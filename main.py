from manim import *


class Show(Scene):
    def __init__(self):
        self.words = 

        self.wins = []

    def get_wins(self):

        pass


    def construct(self):
        # 获取画布的宽度和高度
        width = config.frame_width
        height = config.frame_height

        # 绘制垂直线，将画布分为左右两部分
        vertical_line = Line(UP * height / 2 + RIGHT, DOWN * height / 2 + RIGHT)
        self.add(vertical_line)

        # 绘制水平线，将左边区域分为上下两部分
        horizontal_line = Line(LEFT * width / 2, ORIGIN+ RIGHT)
        self.add(horizontal_line)
        
        # 窗口 1
        win_1_center = 

        with register_font("./雅黑consolas混合字体.ttf"):
            # text1 = MarkupText("I ", font="YaHei Consolas Hybrid", font_size=20)
            # text2 = MarkupText("like ", font="YaHei Consolas Hybrid", font_size=20)
            # text3 = MarkupText("U", font="YaHei Consolas Hybrid", font_size=20)
            # text4 = MarkupText("word", font="YaHei Consolas Hybrid", font_size=20)
            # text5 = MarkupText("nihao", font="YaHei Consolas Hybrid", font_size=20)
            # text6 = MarkupText("play", font="YaHei Consolas Hybrid", font_size=20)
            # group = VGroup(text1, text2, text3,text4, text5, text6).arrange(RIGHT*0.5)
            text = (
                "In the business world, when dealing with an iconic company's"
                "patent issues, there is often no quick consensus sdaf"
                "patent issues, there is often no 你好 consensus sdaf"
                "patent issues, there is often no quick consensus sdaf"
                "patent issues, there is often no 你好 consensus sdaf"
                "patent issues, there is often no quick consensus sdaf"
                "patent issues, there is often no 你好 consensus sdaf"
                "patent issues, there is often no quick consensus sdaf"
                "patent issues, there is often no 你好 consensus sdaf"
                "patent issues, there is often no quick consensus sdaf"
                "patent issues, there is often no 你好 consensus sdaf"
            )
            text = MarkupText(text, font="YaHei Consolas Hybrid", font_size=48, justify=True, width=7, height=4)
            offset = text.get_right() + text.get_bottom()
            self.add(Dot(text.get_right() + text.get_top(), color=RED))
            self.add(Dot(text.get_left()+text.get_top(), color=RED))
            text.shift([-6.5, 3.5, 0]+offset)
            # self.add(text7)
            # self.add(group)
            self.add(text)