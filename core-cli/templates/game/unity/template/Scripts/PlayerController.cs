using UnityEngine;

public class PlayerController : MonoBehaviour
{
    public float moveSpeed = 5f;
    public float rotationSpeed = 150f;

    void Update()
    {
        Move();
        Rotate();
    }

    void Move()
    {
        float move = Input.GetAxis("Vertical") * moveSpeed * Time.deltaTime;
        transform.Translate(0, 0, move);
    }

    void Rotate()
    {
        float turn = Input.GetAxis("Horizontal") * rotationSpeed * Time.deltaTime;
        transform.Rotate(0, turn, 0);
    }
}
