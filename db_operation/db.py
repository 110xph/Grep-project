import psycopg2
import os
import sys
import re


def table_col(file_name='tpch'):
    """read (tables, columns) from the table definition file"""
    
    path = './data/' + file_name + "/sql/{}-create.sql".format("tpch")
    regex = re.compile(';\($')
    
    tbl_name = {}
    tbl = ""
    with open(path, 'r') as f:
        for line in f.readlines():
            if "CREATE TABLE" in line:
                tbl = line.split()[2]
                tbl_name[tbl.lower()] = []
            elif line != "\n" and ');' not in line and regex.search(line) == None:
                    col = line.split()[0]
                    tbl_name[tbl.lower()].append(col.lower())
    return tbl_name

"""
todo: no-predicate, nested-predicate,
    alias, aggregate("sum(l_quantity) > 313", 
    "substring(c_phone from 1 for 2) in ('40', '31', '39', '27', '20', '26', '33')")
    logical ops: or/and
"""

def execute_sql(sql):
    """execute sql and fetch the results"""
    
    conn = psycopg2.connect(database='tpch1x', # tpch1x (0.1m, 10m), tpch100m (100m)
                            user='postgres',
                            password='postgres',
                            host='localhost',
                            port=5301)
    fail = 0
    cur = conn.cursor()
    try:
        cur.execute(sql)
    except:
        fail = 1
    res = []
    if fail==0:
        res = cur.fetchall()
    
    conn.commit() # todo
    cur.close()
    conn.close()
    
    return res


def is_legal_prdicate(predicate):
    """ Check whether a line contains legal select/project/join (SPJ) predicate"""

    is_legal = 0
    res = ''
    
    regex = re.compile('^.*\ (like|\=|\<\=|\>\=|\<|\>|in|\ between\ )\ .*$')
    if regex.search(predicate) is not None:
        predicate = predicate.split('\t')
        line = [x for x in predicate if x != ''][0]
        if '\n' in line:
            line = line[:-1]
        # remove logic ops (and/when/or)
        treg = re.compile('^and |^when |^or ')
        if treg.search(line):
            line = line[treg.search(line).end():]
        # remove nested
        rreg = re.compile('\($')        
        # remove alias        
        areg = re.compile('^.*(l1|l2|l3|n1|n2|n3).*$')
        if rreg.search(line) is None and areg.search(line) is None:
            is_legal = 1
            res = line    
    return is_legal,res

def select_or_join(predicate):
    cons = predicate.split()
    tbls = []
    ptype = 0 # 1-select 2-join 0-illegal
    for c in cons:
        if c in cols and cols[c] not in tbls:
            tbls.append(cols[c])
    ptype = len(tbls)
         
    return ptype,tbls

def parse_workload(folder_name='tpch'):
    # extract sqls from .sql files
    path = './data/'+folder_name
    res = subprocess.check_output('ls '+path, shell=True).decode("utf-8")
    sqls = res.split('\n')
    regex = re.compile('^.*[0-9]\.sql')
    nsqls = []
    for r in sqls:
        if regex.search(r) is not None:
            nsqls.append(r)               # note: it is not a good idea to update an array while iterating the array 
    sqls = nsqls
    print(sqls)
    
    # extract predicates
    q_joins = []
    q_selects = []
    jc_graph = {}         # {"join predicate": "frequency"}
    s_grpah = {}
    cnt = 0
    j_cnt = 0
    for sql in sqls:
        # "select xxx"
        with open(path+'/'+sql, 'r') as f:
            joins = []
            filters = {}
            for line in f.readlines():
                legal,predicate = is_legal_prdicate(line)
                if 1 == legal:
                    cnt = cnt + 1
                    ptype,tbls = select_or_join(predicate)
                    if 1==ptype: # select
                        if tbls[0] not in filters:
                            filters[tbls[0]] = [predicate]
                        else:
                            filters[tbls[0]].append(predicate)
                        q_selects.append(predicate)
                    elif 2==ptype: # join
                        j_cnt = j_cnt + 1
                        joins.append(predicate)
            for join in joins: # generate atomic predicates
                if join not in jc_graph:
                    jc_graph[join] = 1
                else:
                    jc_graph[join] = jc_graph[join] + 1
                
                ptype,tbls = select_or_join(join)
                if tbls[0] in filters:
                    for f in filters[tbls[0]]:
                        join = join + ' and ' + f
                if tbls[1] in filters:
                    for f in filters[tbls[1]]:
                        join = join + ' and ' + f            
                q_joins.append(join)
#    print(cnt)
    print("[join number] ", j_cnt)
    return q_joins,jc_graph, q_selects

def preprocess(filename):
    with open(filename, "r", encoding="utf-8") as f1, open("%s.bak" % filename, "w", encoding="utf-8") as f2:
        for line in f1.readlines():
            line = line.rstrip()
            if line[-1] == '|':
                line = line[:-1]
            f2.write(line + '\n')
    os.remove(filename)
    os.rename("%s.bak" % filename, filename)

def execute_workload(folder_name):
    conn = psycopg2.connect(dbname=folder_name, # tpch1x (0.1m, 10m), tpch100m (100m)
                            user='postgres',
                            password='postgres',
                            host='127.0.0.1',
                            port=5301)

    fail = False
    sql_latency = {}
    cur = conn.cursor()
    try:
        cur.execute('DROP SCHEMA public CASCADE;\n\
                CREATE SCHEMA public;\n\
                GRANT ALL ON SCHEMA public TO postgres;\n\
                GRANT ALL ON SCHEMA public TO public;')
    except:
        fail = True
    path = os.path.join('.', 'data', folder_name)
    path_create = os.path.join(path, 'sql', "{}-create.sql".format("tpch"))
    with open(path_create, 'r') as f:
        sql = ''.join(f.readlines())
        try:
            cur.execute(sql)
        except:
            fail = True
        if not fail:
            path_data = os.path.join(path, 'data')
            for filename in os.listdir(path_data):
                file_name = os.path.join(path_data, filename)
                preprocess(file_name)
                tbl_name = filename.split('.')[0]
                try:
                    cur.execute("copy {} from '{}' WITH DELIMITER AS '|';".format(tbl_name, os.path.abspath(file_name)))
                except:
                    fail = True
            if not fail:
                path_sql = os.path.join(path, 'sql')
                regex = re.compile('^([0-9]*)\.sql')
                for filename in os.listdir(path_sql):
                    m = re.match(regex, filename)
                    if m is not None:
                        file_name = os.path.join(path_sql, filename)
                        with open(file_name, 'r') as f:
                            sql = 'EXPLAIN ANALYZE\n' + ''.join(f.readlines())
                            sql_fail = False
                            try:
                                cur.execute(sql)
                                conn.commit()
                            except:
                                sql_fail = True
                            if not sql_fail:
                                res = cur.fetchall()[-1][0]
                                regex_latency = re.compile('^Execution time: (.*?) ms$')
                                latency = float(re.match(regex_latency, res).group(1))
                                r = int(m.group(1))
                                print(r)
                                print(latency)
                                sql_latency[r] = latency
    
    print(sql_latency)
    print(fail)
    conn.commit()    
     # todo
    cur.close()
    conn.close()

if __name__ == '__main__':
    folder_name = sys.argv[1]
    tbl_name = table_col(folder_name)
    execute_workload(folder_name)

