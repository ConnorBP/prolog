
program http #machine := "prolog.http"

	[
		webserver FULL_HEADER_TEXT param HTTP_URI HTTP_PROTOCOL HTTP_HEADER
		GET POST PUT PATCH DELETE COPY HEAD OPTIONS LINK UNLINK PURGE
		GETter FORM FORMatter
	]

#machine webserver := "webserver"

[[GET *res *content] / [*res "<a href=\"/\" />" *content "</a>"]]
[[GET *res : *command] / [*res "<a href=\""] / [GETter *res : *command]]
[[GETter *res *p1 *p2 : *tail] / [*res "/" *p1] / [GETter *res *p2 : *tail]]
[[GETter *res *content] [*res "\" />" *content "</a>"]]
[[GETter *res]]

[[FORM *res *method] / [*res "<form action=\"/\" method=\"" *method "\" />"]]
[[FORM *res *method *p : *ps] / [*res "<form method=\"" *method "\" action=\""] / [FORMatter *res *p : *ps]]
[[FORM *res] / [*res "</form>"]]
[[FORMatter *res *p1 : *ps] [*res "/" *p1] / [FORMatter *res : *ps]]
[[FORMatter *res] [*res "\" />"]]

[[param *res *name] [*res "<input type=\"text\" name=\"" *name "\" />"]]
[[param *res *type *name] [*res "<input type=\"" *type "\" name=\"" *name "\" />"]]
[[param *res *type *name *value] [*res "<input type=\"" *type "\" name=\"" *name "\" value=\"" *value "\" />"]]

protect [GET GETter FORMatter param]
private [GETter FORMatter]

end .
