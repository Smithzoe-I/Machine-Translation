from myanmartools import ZawgyiDetector
from icu import Transliterator     #this library change formats, uni to zawgyi

detector = ZawgyiDetector()         # Assign the fuction into a variable named detector
converter = Transliterator.createInstance('Zawgyi-my')    # Assign the fuction into a variable named converter

def detect_and_convert(text):
    """
    Detect if the text is in Zawgyi or Unicode.
    If it's Zawgyi, convert it to Unicode.
    """
    #detect the encoding
    zawgyi_probability = detector.get_zawgyi_probability(text) #Assign the zawgyi probability function into a variable named zawgyi_probability

    #if the probability is greater than 0.5 , assume it's Zawgyi
    if zawgyi_probability > 0.5:
      unicode_text = converter.transliterate(text)   #this convert from zawgyi to unicode
      return unicode_text
    else:
      return text