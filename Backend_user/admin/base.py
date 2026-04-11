from ..Database import Database


class AdminServiceBase:
    def __init__(self):
        self.db = Database()

    def _success_response(self, data=None, message=None, **extra):
        response = {"success": True}
        if message:
            response["message"] = message
        if data is not None:
            response["data"] = data
        response.update(extra)
        return response

    def _error_response(self, error, message=None, **extra):
        response = {"success": False, "error": error}
        if message:
            response["message"] = message
        response.update(extra)
        return response

    def _close_cursor(self, cursor):
        if cursor:
            cursor.close()

    def _close_db(self):
        try:
            self.db.close()
        except Exception:
            pass

    def _validate_limit_offset(self, limit, offset):
        try:
            limit = int(limit)
            offset = int(offset)
        except (TypeError, ValueError):
            return False, None, None, "Limit and offset must be integers"

        if limit <= 0:
            return False, None, None, "Limit must be greater than 0"
        if offset < 0:
            return False, None, None, "Offset cannot be negative"

        return True, limit, offset, None

    def _validate_limit(self, limit):
        try:
            limit = int(limit)
        except (TypeError, ValueError):
            return False, None, "limit must be an integer"

        if limit <= 0:
            return False, None, "limit must be greater than 0"

        return True, limit, None
