import zipfile
import xml.etree.ElementTree as ET

def extract_text_from_docx(docx_path):
    try:
        with zipfile.ZipFile(docx_path) as docx:
            xml_content = docx.read('word/document.xml')
            tree = ET.XML(xml_content)
            
            # The namespace for w:t (text) nodes
            WORD_NAMESPACE = '{http://schemas.openxmlformats.org/wordprocessingml/2006/main}'
            TEXT_TAG = WORD_NAMESPACE + 't'
            
            text = []
            for node in tree.iter(TEXT_TAG):
                if node.text:
                    text.append(node.text)
            return '\n'.join(text)
    except Exception as e:
        return str(e)

print(extract_text_from_docx(r"c:\Users\Sachintha Praneeth\Desktop\Smart-Library-System\docs\screenshots\IT3060HCI2026_Milestone02_GroupWE_32.docx"))
