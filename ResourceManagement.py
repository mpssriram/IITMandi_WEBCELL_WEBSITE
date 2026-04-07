import os
import shutil
from Backend.Database import Database

class ResourceManagement:
    """
    Admin-only digital resource management system.
    Handles creating, retrieving, updating, and deleting resources.
    """

    def __init__(self):
        self.db = Database()
        self.resources_dir = os.path.join(os.getcwd(), 'resources')
        os.makedirs(self.resources_dir, exist_ok=True)

    def create_resource(self, resource_data):
        """
        Create a new resource.
        resource_data: dict with keys: title, description, type, url, category, uploaded_by
        For PDFs, url should be the file path to upload.
        """
        title = resource_data.get('title')
        description = resource_data.get('description') or None 
        resource_type = resource_data.get('type') or None
        url = resource_data.get('url') or None 
        category = resource_data.get('category') or None
        uploaded_by = resource_data.get('uploaded_by') or None

        if resource_type == 'pdf':
            if not os.path.exists(url):
                print("PDF file does not exist")
                return {"success": False, "error": "File not found"}
            # Copy file to resources directory
            file_name = f"{title.replace(' ', '_')}_{os.path.basename(url)}"
            dest_path = os.path.join(self.resources_dir, file_name)
            shutil.copy2(url, dest_path)
            url = dest_path

        cursor = None
        try:
            cursor = self.db.get_cursor()
            sql = """
            INSERT INTO resources (
                title, description, type, url, category, uploaded_by, created_at
            ) VALUES (%s, %s, %s, %s, %s, %s, NOW())
            """
            cursor.execute(sql, (title, description, resource_type, url, category, uploaded_by))
            self.db.commit()
            resource_id = cursor.lastrowid
            print(f"Resource created successfully: {title}")
            return {"success": True, "resource_id": resource_id}
        except Exception as e:
            self.db.rollback()
            print(f"Error creating resource: {e}")
            return {"success": False, "error": str(e)}
        finally:
            if cursor:
                cursor.close()

    def get_all_resources(self, limit=10, offset=0):
        """
        Retrieve all resources with pagination.
        """
        cursor = None
        try:
            cursor = self.db.get_cursor()
            sql = """
            SELECT id, title, description, type, url, category, uploaded_by, created_at
            FROM resources
            ORDER BY created_at DESC
            LIMIT %s OFFSET %s
            """
            cursor.execute(sql, (limit, offset))
            resources = cursor.fetchall()
            print(f"Retrieved {len(resources)} resources")
            return resources
        except Exception as e:
            print(f"Error retrieving resources: {e}")
            return []
        finally:
            if cursor:
                cursor.close()

    def get_resource_by_id(self, resource_id):
        """
        Retrieve a specific resource by ID.
        """
        cursor = None
        try:
            cursor = self.db.get_cursor()
            sql = """
            SELECT id, title, description, type, url, category, uploaded_by, created_at
            FROM resources
            WHERE id = %s
            """
            cursor.execute(sql, (resource_id,))
            resource = cursor.fetchone()
            if resource:
                print(f"Resource found: {resource['title']}")
                return resource
            else:
                print("Resource not found")
                return None
        except Exception as e:
            print(f"Error retrieving resource: {e}")
            return None
        finally:
            if cursor:
                cursor.close()

    def update_resource(self, resource_id, resource_data):
        """
        Update an existing resource.
        resource_data: dict with keys to update
        """
        cursor = None
        try:
            cursor = self.db.get_cursor()
            sql = """
            UPDATE resources
            SET title = %s, description = %s, type = %s, url = %s, category = %s
            WHERE id = %s
            """
            cursor.execute(sql, (
                resource_data.get('title'),
                resource_data.get('description'),
                resource_data.get('type'),
                resource_data.get('url'),
                resource_data.get('category'),
                resource_id
            ))
            self.db.commit()
            affected_rows = cursor.rowcount
            if affected_rows > 0:
                print(f"Resource updated successfully")
                return {"success": True, "affected_rows": affected_rows}
            else:
                print("Resource not found or no changes made")
                return {"success": False, "message": "Resource not found"}
        except Exception as e:
            self.db.rollback()
            print(f"Error updating resource: {e}")
            return {"success": False, "error": str(e)}
        finally:
            if cursor:
                cursor.close()

    def delete_resource(self, resource_id):
        """
        Delete a resource by ID.
        """
        cursor = None
        try:
            # Check if it's a PDF and delete file
            resource = self.get_resource_by_id(resource_id)
            if resource and resource['type'] == 'pdf' and resource['url']:
                if os.path.exists(resource['url']):
                    os.remove(resource['url'])
                    print(f"PDF file deleted: {resource['url']}")

            cursor = self.db.get_cursor()
            sql = "DELETE FROM resources WHERE id = %s"
            cursor.execute(sql, (resource_id,))
            self.db.commit()
            affected_rows = cursor.rowcount
            if affected_rows > 0:
                print(f"Resource deleted successfully")
                return {"success": True, "affected_rows": affected_rows}
            else:
                print("Resource not found")
                return {"success": False, "message": "Resource not found"}
        except Exception as e:
            self.db.rollback()
            print(f"Error deleting resource: {e}")
            return {"success": False, "error": str(e)}
        finally:
            if cursor:
                cursor.close()

    def get_resource_stats(self):
        """
        Get statistics about resources.
        """
        cursor = None
        try:
            cursor = self.db.get_cursor()
            sql = """
            SELECT
                COUNT(*) as total_resources,
                type,
                COUNT(*) as count_per_type
            FROM resources
            GROUP BY type
            """
            cursor.execute(sql)
            stats = cursor.fetchall()
            print(f"Resource stats: {stats}")
            return stats
        except Exception as e:
            print(f"Error getting resource stats: {e}")
            return []
        finally:
            if cursor:
                cursor.close()


# Example usage (for testing)
if __name__ == "__main__":
    rm = ResourceManagement()

    # Create a sample URL resource
    sample_resource = {
        "title": "Python Documentation",
        "description": "Official Python documentation",
        "type": "article",
        "url": "https://docs.python.org/3/",
        "category": "Programming",
        "uploaded_by": "Admin"
    }

    print("Creating resource...")
    rm.create_resource(sample_resource)

    print("\nGetting all resources...")
    resources = rm.get_all_resources()
    for res in resources:
        print(res)

    print("\nGetting resource stats...")
    stats = rm.get_resource_stats()
    print(stats)




