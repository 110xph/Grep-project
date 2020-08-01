/**
 * Created by yuyu on 2020/5/7.
 */

// resizeContainer('cpu_chart', 'cpu_chart_div', 1, 1);
// resizeContainer('disk_chart', 'disk_chart_div', 1, 1);
// resizeContainer('network_line', 'network_line_div', 1, 1);
// resizeContainer('io_line', 'io_line_div', 1, 1);
// resizeContainer('td_line1', 'td_line1_div', 2, 1);
// resizeContainer('pie_chart', 'pie_chart_div', 1, 1);
// resizeContainer('dbms_line1', 'dbms_line_div', 1, 0.3);


let view_query_id = document.getElementById('view_query');

view_query_id.value="SELECT MIN(t.title) AS movie_title\
FROM keyword AS k,\
     movie_info AS mi,\
     movie_keyword AS mk,\
     title AS t\
WHERE k.keyword LIKE '%sequel%'\
  AND mi.info IN ('Sweden',\
                  'Norway',\
                  'Germany',\
                  'Denmark',\
                  'Swedish',\
                  'Denish',\
                  'Norwegian',\
                  'German')\
  AND t.production_year > 2005\
  AND t.id = mi.movie_id\
  AND t.id = mk.movie_id\
  AND mk.movie_id = mi.movie_id\
  AND k.id = mk.keyword_id;"



