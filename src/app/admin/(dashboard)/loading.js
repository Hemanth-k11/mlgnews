export default function AdminLoading() {
  return (
    <div className="adm-main">
      <div className="adm-toprow">
        <span className="skel skel-line--title" style={{ width: 160, height: 26 }} />
      </div>

      <div className="table-scroll">
        <table className="table">
          <tbody>
            {[0, 1, 2, 3, 4, 5].map((i) => (
              <tr key={i}>
                <td>
                  <span className="skel skel-line skel-line--lg" />
                </td>
                <td>
                  <span className="skel skel-line skel-line--sm" />
                </td>
                <td>
                  <span className="skel skel-line skel-line--sm" />
                </td>
                <td>
                  <span className="skel skel-line skel-line--sm" />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
