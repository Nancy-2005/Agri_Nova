import os
from fpdf import FPDF

def test_tamil_pdf():
    pdf = FPDF()
    pdf.add_page()
    
    font_path = os.path.join(os.getcwd(), "NotoSansTamil-Regular.ttf")
    if not os.path.exists(font_path):
        print(f"Font not found at {font_path}")
        return
        
    # Use fpdf2 native shaping
    pdf.add_font("NotoSansTamil", style="", fname=font_path)
    pdf.set_font("NotoSansTamil", size=12)
    
    # "விவசாயி" (Farmer)
    text = "விவசாயி பெயர்: ரகு"
    pdf.multi_cell(0, 10, text)
    
    pdf.output("tamil_test.pdf")
    print("PDF generated as tamil_test.pdf via fpdf2")

if __name__ == "__main__":
    test_tamil_pdf()

