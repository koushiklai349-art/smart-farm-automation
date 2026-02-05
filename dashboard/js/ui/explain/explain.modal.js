// js/ui/explain/explain.modal.js

export function openExplainModal(contentHTML) {
  let modal = document.getElementById("explain-modal");

  if (!modal) {
    modal = document.createElement("div");
    modal.id = "explain-modal";
    modal.style = `
      position: fixed;
      inset: 0;
      background: rgba(0,0,0,.6);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 9999;
    `;

    modal.innerHTML = `
      <div style="
        background:#fff;
        max-width:600px;
        width:90%;
        max-height:80%;
        overflow:auto;
        padding:16px;
        border-radius:8px;
      ">
        <button id="close-explain" style="float:right;">❌</button>
        <div id="explain-modal-body"></div>
      </div>
    `;

    document.body.appendChild(modal);

    modal.querySelector("#close-explain").onclick = () => {
      modal.remove();
    };
  }

  modal.querySelector("#explain-modal-body").innerHTML = contentHTML;
}
