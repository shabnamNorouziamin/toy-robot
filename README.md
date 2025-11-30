# Toy Robot Challenge — React + TypeScript + Vite

This project contains my implementation of the classic **Toy Robot Challenge**, built using:

- **React**
- **TypeScript**
- **Vite**
- **Tailwind CSS**

The purpose is to demonstrate clean architecture, incremental delivery, and problem-solving skills.  
UI and logic are intentionally separated so the robot rules can be fully tested and reused.

---

## Problem Description

Simulate a toy robot moving on a **5×5 tabletop**, following these rules:

- The table has no obstacles.
- The robot cannot fall off the table.
- Any move that would cause a fall must be **ignored**.
- The **first valid** command must be `PLACE`.
- Until the robot is placed, all commands except `PLACE` are ignored.

---

## Supported Commands

### `PLACE X,Y,F`
Places the robot at coordinates `(X, Y)` and facing `F`, where:

- `X` and `Y` are integers from 0 to 4
- `F ∈ {NORTH, SOUTH, EAST, WEST}`  
- `(0,0)` is the **south-west** corner.

### `MOVE`
Moves the robot 1 unit forward in the direction it’s facing.

### `LEFT` / `RIGHT`
Rotates the robot **90°** without changing its position.

### `REPORT`
Outputs the robot’s current `X,Y,F`.

---

## Example Scenarios

### Example A
```
PLACE 0,0,NORTH
MOVE
REPORT
```

Output:
`0,1,NORTH`

### Example B
```
PLACE 0,0,NORTH
LEFT
REPORT
```

Output:
`0,0,WEST`

### Example C
```
PLACE 1,2,EAST
MOVE
MOVE
LEFT
MOVE
REPORT
```

Output:
`3,3,NORTH`