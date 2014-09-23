print "Content-Type: application/json\n\n"

import cgi, cgitb

form = cgi.FieldStorage() 

fields = {}
fields["professional-golf"] = ["All", "PGA Tour", "LPGA", "European", "Other"]
fields["college-golf"] = ["All", "Men", "Women"]
fields["amateur-golf"] = ["All", "Men", "Women"]
fields["junior-golf"] = ["All"]
fields["travel"] = ["All", "Golfweek's Best", "The Golf Life", "Rater's Notebook"]
fields["equipment"] = ["All"]
fields["for-your-game"] = ["All"]

value = str(form.getvalue('sub'))

try:
	answer = '{"%s": "%s"}' % ('value', fields[value])
except KeyError, e:
	answer = '{"%s": "KeyError @ %s"}' % ('value', value)

print answer