def config(folder_name, port):
    db_conn_config = {
    	'dbname':folder_name,
        'user':'postgres',
        'password':'postgres',
        'host':'localhost',
        'port':port
    }

    return db_conn_config