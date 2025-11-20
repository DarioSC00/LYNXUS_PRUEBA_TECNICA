import datetime


def test_create_task_due_date_invalid(client, project_id):
    payload = {"title": "Invalid due", "due_date": "2000-01-01T00:00:00"}
    r = client.post(f"/projects/{project_id}/tasks", json=payload)
    assert r.status_code == 400


def test_create_task_ok(client, project_id):
    future = (datetime.datetime.utcnow() + datetime.timedelta(days=1)).isoformat()
    payload = {"title": "Future task", "due_date": future}
    r = client.post(f"/projects/{project_id}/tasks", json=payload)
    assert r.status_code == 201
    data = r.json()
    assert data.get("title") == "Future task"


def test_update_task_due_date_invalid(client, project_id):
    # Create a task without due_date
    payload = {"title": "To update"}
    r = client.post(f"/projects/{project_id}/tasks", json=payload)
    assert r.status_code == 201
    task_id = r.json().get("id")

    # Try to update with a past due_date
    r2 = client.put(f"/tasks/{task_id}", json={"due_date": "2000-01-01T00:00:00"})
    assert r2.status_code == 400
