function logoutModal() {
    return `
<div class="modal fade" id="logoutModal" tabindex="-1">

    <div class="modal-dialog">

        <div class="modal-content">

            <div class="modal-header">
                <h5 class="modal-title">Cerrar sesión</h5>
                <button class="close" data-dismiss="modal">&times;</button>
            </div>

            <div class="modal-body">
                ¿Seguro que deseas cerrar sesión?
            </div>

            <div class="modal-footer">

                <a class="btn btn-secondary" data-dismiss="modal">Cancelar</a>

                <a class="btn btn-primary" href="../RegistroAdmin/logout">
                    Cerrar sesión
                </a>

            </div>

        </div>

    </div>

</div>
`;
}

module.exports = logoutModal;