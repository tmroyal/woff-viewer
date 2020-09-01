import csv
import json

''' This script takes in a file UnicodeData.txt,
    presumably obtained from 
    http://unicode.org/Public/UNIDATA/UnicodeData.txt,
    and outputs it as minified JSON'''

with open('UnicodeData.txt') as f:
  reader = csv.reader(f, delimiter=';')
  output = {}
  for row in reader:
    code = int(row[0], 16)
    d1 = row[1].title()
    d2 = row[10].title()

    if d1 == '<Control>' or (len(d2) > 0 and len(d2)<len(d1)):
      output[str(code)] = d2
    else:
      output[str(code)] = d1

with open('../../unicodeNames.json','w') as f:
  f.write(json.dumps(output, separators=(',', ':')))