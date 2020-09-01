import json

''' This script takes in a file UnicodeData.txt,
    presumably obtained from 
    http://www.unicode.org/Public/UNIDATA/NamesList.txt
    and outputs it as minified JSON'''

with open("NamesList.txt", "r") as f:
  lines = f.readlines()

data = {}

for l in lines:
  if l.startswith("@@\t"):
    # @@, range bottom, name, range top
    datum = l.strip("\n").split("\t")
    datum_dict = {}
    datum_dict["lo"] = int(datum[1], 16)
    datum_dict["hi"] = int(datum[3], 16)
    data[datum[2]] = datum_dict

with open('../../unicodeRanges.json','w') as f:
  f.write(json.dumps(data, separators=(',', ':')))