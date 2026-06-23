try:
    import pymysql
except ImportError:  # pragma: no cover
    pymysql = None

if pymysql:
    pymysql.install_as_MySQLdb()

