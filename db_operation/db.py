import psycopg2
import os
import sys
import re
import time
from config import config


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

def fetch_all_sql(sql, folder_name, port = 5301):
    res = None

    conn = None
    try:
        """execute sql and fetch the results"""
        params = config(folder_name, port)
        conn = psycopg2.connect(**params)
        cur = conn.cursor()

        fail = False
        try:
           cur.execute(sql)
        except:
            fail = True
        if not fail:
           res = cur.fetchall()

        conn.commit()       
        cur.close()
    except (Exception, psycopg2.DatabaseError) as error:
        print(error)
    finally:
        if conn is not None:
            conn.close()
    
    return res

def fetch_one_sql(sql, folder_name, port = 5301):
    res = None

    conn = None
    try:
        """execute sql and fetch the results"""
        params = config(folder_name, port)
        conn = psycopg2.connect(**params)
        cur = conn.cursor()

        fail = False
        try:
           cur.execute(sql)
        except:
            fail = True
        if not fail:
           res = cur.fetchone()

        conn.commit()       
        cur.close()
    except (Exception, psycopg2.DatabaseError) as error:
        print(error)
    finally:
        if conn is not None:
            conn.close()
    
    return res

def execute_sql(sql, folder_name, port = 5301):

    fail = False

    conn = None
    try:
        """execute sql and fetch the results"""
        params = config(folder_name, port)
        conn = psycopg2.connect(**params)
        cur = conn.cursor()
        cur.execute(sql)
        conn.commit()       
        cur.close()
    except (Exception, psycopg2.DatabaseError) as error:
        print(error)
        fail = True
    finally:
        if conn is not None:
            conn.close()

    return fail

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

def create_dataset(folder_name):
    fail = False
    fail = fail | execute_sql('DROP SCHEMA public CASCADE;\
                CREATE SCHEMA public;\
                GRANT ALL ON SCHEMA public TO postgres;\
                GRANT ALL ON SCHEMA public TO public;', folder_name)


    path = os.path.join('.', 'data', folder_name)
    path_create = os.path.join(path, 'sql', "{}-create.sql".format("tpch"))

    with open(path_create, 'r') as f:
        fail = fail | execute_sql(''.join(f.readlines()), folder_name)
        if not fail:
            path_data = os.path.join(path, 'data')
            r_tbl = re.compile('.*\.tbl$')
            for filename in os.listdir(path_data):
                if r_tbl.search(filename) is not None:
                    file_name = os.path.join(path_data, filename)
                    tbl_name = filename.split('.')[0]
                    fail = fail | execute_sql("copy {} from '{}' WITH DELIMITER AS '|';".format(tbl_name, os.path.abspath(file_name)), folder_name)

    path_dss = os.path.join(path, 'data', 'dss.ri') # 去掉dss.ri中多主键以及外键相关的内容
    with open(path_dss, 'r') as f:
        fail = fail | execute_sql(''.join(f.readlines()), folder_name)
        
    return not fail

def execute_workload(folder_name):
    fail = False

    fail = fail | execute_sql('CREATE EXTENSION pg_stat_statements;\
                SELECT pg_stat_statements_reset();', folder_name)

    path_sql = os.path.join('.', 'data', folder_name, 'sql')
    r_sql = re.compile('^([0-9]*)\.sql')
    for filename in os.listdir(path_sql):
        m = re.match(r_sql, filename)
        if m is not None:
            file_name = os.path.join(path_sql, filename)
            with open(file_name, 'r') as f:
                sql = ''
                for line in f.readlines():
                    if line[:2] != '--' and line != '\n':
                        line = line.strip()
                        sql += line
                        sql += ' '
                fail = fail | execute_sql(sql, folder_name)
                                
    return not fail

def top_slow_sql(folder_name):
    return fetch_all_sql('SELECT query, total_time FROM pg_stat_statements ORDER BY total_time DESC LIMIT 10;', folder_name)


def info(tbl_name, folder_name, port):
    node_info = {}
    
    for tbl in tbl_name:
        node_info[tbl] = fetch_one_sql('select count(*) from {};'.format(tbl), folder_name, port)[0]
  
    return node_info

if __name__ == '__main__':
    folder_name = sys.argv[1]
    tbl_name = table_col(folder_name)
    if create_dataset(folder_name):
        partition_ratio = [] # 各结点划分比例
        table_info = info(tbl_name, folder_name, 5301)
        for i in range(1, 4):
            node_info = info(tbl_name, folder_name, 5400 + i)
            for tbl in node_info:
                node_info[tbl] = node_info[tbl] / table_info[tbl]
            partition_ratio.append(node_info)
        print(partition_ratio)

        if execute_workload(folder_name):
            sql_latency = top_slow_sql(folder_name)
            print(sql_latency)
        


