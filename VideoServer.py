import os
from flask import Flask, render_template_string, send_from_directory, abort, url_for

app = Flask(__name__)

# --- Configuration ---
# 將此設定為您要瀏覽的根目錄。
# os.path.expanduser("~") 會將其設定為您的主目錄 (例如 /Users/ben)。
# 出於安全考量，伺服器不允許存取此目錄之外的檔案。
BASE_DIR = os.path.abspath(os.path.expanduser("~"))

# --- HTML Template for Directory Listing ---
HTML_TEMPLATE = """
<!DOCTYPE html>
<html>
<head>
    <title>File Browser - {{ display_path }}</title>
    <style>
        body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif; margin: 2em; background-color: #f8f9fa; color: #212529; }
        .container { max-width: 800px; margin: auto; }
        h1 { border-bottom: 2px solid #dee2e6; padding-bottom: 10px; font-size: 1.75rem; }
        ul { list-style-type: none; padding: 0; }
        li { display: flex; align-items: center; padding: 8px 12px; border-bottom: 1px solid #e9ecef; }
        li:last-child { border-bottom: none; }
        a { text-decoration: none; color: #007bff; font-size: 1rem; }
        a:hover { text-decoration: underline; }
        .icon { font-size: 1.2rem; margin-right: 10px; width: 20px; text-align: center; }
        .parent-dir a { font-weight: bold; }
    </style>
</head>
<body>
    <div class="container">
        <h1>Browsing: {{ display_path }}</h1>
        <ul>
            {% if show_parent_link %}
            <li class="parent-dir">
                <span class="icon">⬆️</span>
                <a href="{{ url_for('browse', subpath=parent_dir) }}">.. (Parent Directory)</a>
            </li>
            {% endif %}
            {% for item in items %}
                <li>
                    <span class="icon">{% if item.is_dir %}📁{% else %}📄{% endif %}</span>
                    <a href="{{ url_for('browse', subpath=item.path) }}">{{ item.name }}</a>
                </li>
            {% endfor %}
        </ul>
    </div>
</body>
</html>
"""

@app.route('/')
@app.route('/<path:subpath>')
def browse(subpath=''):
    """
    提供檔案服務或列出目錄內容。
    """
    # 建立安全、絕對的路徑
    abs_path = os.path.join(BASE_DIR, subpath)
    
    # 確認請求的路徑在 BASE_DIR 中，防止目錄遍歷攻擊
    if not os.path.normpath(abs_path).startswith(os.path.normpath(BASE_DIR)):
        abort(403)  # Forbidden

    if not os.path.exists(abs_path):
        abort(404)  # Not Found

    # 如果是檔案，則提供該檔案
    if os.path.isfile(abs_path):
        directory = os.path.dirname(abs_path)
        filename = os.path.basename(abs_path)
        # send_from_directory 會處理安全性、影片串流的範圍請求等
        return send_from_directory(directory, filename)

    # 如果是目錄，則列出其內容
    if os.path.isdir(abs_path):
        items = []
        try:
            # 排序並過濾隱藏檔案
            dir_list = sorted(os.listdir(abs_path), key=lambda x: x.lower())
            for name in dir_list:
                if name.startswith('.'):
                    continue
                
                item_path = os.path.join(subpath, name)
                is_dir = os.path.isdir(os.path.join(abs_path, name))
                items.append({'name': name, 'path': item_path, 'is_dir': is_dir})
        except OSError:
            abort(500, "Error reading directory.")

        # 顯示父目錄連結的邏輯
        show_parent_link = subpath != ''
        parent_dir = os.path.dirname(subpath) if show_parent_link else ''
        
        display_path = '/' + subpath if subpath else '/'

        return render_template_string(
            HTML_TEMPLATE,
            display_path=display_path,
            items=items,
            show_parent_link=show_parent_link,
            parent_dir=parent_dir
        )

    abort(404)


if __name__ == '__main__':
    print(f"Serving files from base directory: {BASE_DIR}")
    print("Open http://127.0.0.1:5001 in your browser.")
    app.run(debug=True, threaded=True, port=5001)