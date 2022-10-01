import { useGizmoList } from "~/Game";
import "./GizmoGrid.css";

export const GizmoGrid = () => {
    const gizmos = useGizmoList();

    return (
        <div class="gizmoGrid">
            {gizmos.value.map((GizmoComponent, index) => {
                return <GizmoComponent key={index} />;
            })}
        </div>
    );
};
