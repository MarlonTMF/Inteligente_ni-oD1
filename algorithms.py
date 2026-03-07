import collections
import heapq

def get_neighbors(q, r):
    directions = [
        (1, 0), (1, -1), (0, -1),
        (-1, 0), (-1, 1), (0, 1)
    ]
    return [(q + dq, r + dr) for dq, dr in directions]

def hex_manhattan_distance(q1, r1, q2, r2):
    return (abs(q1 - q2) + abs(q1 + r1 - q2 - r2) + abs(r1 - r2)) / 2

def reconstruct_path(parent, target_key):
    path = []
    curr = target_key
    while curr:
        q, r = map(int, curr.split(','))
        path.insert(0, {"q": q, "r": r})
        curr = parent.get(curr)
    return path

def bfs(start, target, grid_costs):
    start_key = f"{start['q']},{start['r']}"
    target_key = f"{target['q']},{target['r']}"
    
    queue = collections.deque([start])
    visited = {start_key}
    parent = {start_key: None}
    explored_steps = [] # To keep track of visualization if needed

    while queue:
        current = queue.popleft()
        current_key = f"{current['q']},{current['r']}"
        explored_steps.append(current)

        if current_key == target_key:
            return reconstruct_path(parent, target_key), explored_steps

        for n_q, n_r in get_neighbors(current['q'], current['r']):
            n_key = f"{n_q},{n_r}"
            if n_key in grid_costs and grid_costs[n_key] != float('inf') and n_key not in visited:
                visited.add(n_key)
                parent[n_key] = current_key
                queue.append({"q": n_q, "r": n_r})
    
    return [], explored_steps

def dfs(start, target, grid_costs):
    start_key = f"{start['q']},{start['r']}"
    target_key = f"{target['q']},{target['r']}"
    
    stack = [start]
    visited = set()
    parent = {start_key: None}
    explored_steps = []

    while stack:
        current = stack.pop()
        current_key = f"{current['q']},{current['r']}"
        
        if current_key in visited:
            continue
            
        visited.add(current_key)
        explored_steps.append(current)

        if current_key == target_key:
            return reconstruct_path(parent, target_key), explored_steps

        for n_q, n_r in get_neighbors(current['q'], current['r']):
            n_key = f"{n_q},{n_r}"
            if n_key in grid_costs and grid_costs[n_key] != float('inf') and n_key not in visited:
                parent[n_key] = current_key
                stack.append({"q": n_q, "r": n_r})
    
    return [], explored_steps

def uniform_cost_search(start, target, grid_costs):
    start_key = f"{start['q']},{start['r']}"
    target_key = f"{target['q']},{target['r']}"
    
    # priority, q, r
    pq = [(0, start['q'], start['r'])]
    costs = {start_key: 0}
    parent = {start_key: None}
    explored_steps = []
    visited = set()

    while pq:
        priority, q, r = heapq.heappop(pq)
        current_key = f"{q},{r}"
        
        if current_key in visited:
            continue
        visited.add(current_key)
        explored_steps.append({"q": q, "r": r})

        if current_key == target_key:
            return reconstruct_path(parent, target_key), explored_steps

        for n_q, n_r in get_neighbors(q, r):
            n_key = f"{n_q},{n_r}"
            if n_key in grid_costs and grid_costs[n_key] != float('inf'):
                new_cost = costs[current_key] + grid_costs[n_key]
                if n_key not in costs or new_cost < costs[n_key]:
                    costs[n_key] = new_cost
                    parent[n_key] = current_key
                    heapq.heappush(pq, (new_cost, n_q, n_r))
    
    return [], explored_steps

def a_star(start, target, grid_costs):
    start_key = f"{start['q']},{start['r']}"
    target_key = f"{target['q']},{target['r']}"
    
    # f_score, q, r
    pq = [(0, start['q'], start['r'])]
    g_costs = {start_key: 0}
    parent = {start_key: None}
    explored_steps = []
    visited = set()

    while pq:
        f_score, q, r = heapq.heappop(pq)
        current_key = f"{q},{r}"
        
        if current_key in visited:
            continue
        visited.add(current_key)
        explored_steps.append({"q": q, "r": r})

        if current_key == target_key:
            return reconstruct_path(parent, target_key), explored_steps

        for n_q, n_r in get_neighbors(q, r):
            n_key = f"{n_q},{n_r}"
            if n_key in grid_costs and grid_costs[n_key] != float('inf'):
                new_g_cost = g_costs[current_key] + grid_costs[n_key]
                if n_key not in g_costs or new_g_cost < g_costs[n_key]:
                    g_costs[n_key] = new_g_cost
                    parent[n_key] = current_key
                    f = new_g_cost + hex_manhattan_distance(n_q, n_r, target['q'], target['r'])
                    heapq.heappush(pq, (f, n_q, n_r))
    
    return [], explored_steps
