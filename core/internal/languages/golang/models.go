package golang

import (
	"github.com/intelops/compage/core/internal/languages"
	"github.com/intelops/compage/core/internal/utils"
)

// TemplatesPath directory of template files
const TemplatesPath = "templates/compage-template-go"

var templatesRootPath = utils.GetProjectRootPath(TemplatesPath)

// LGolangNode language specific struct.
type LGolangNode struct {
	*languages.LanguageNode
}

// FillDefaults constructor function
func (n *LGolangNode) FillDefaults() error {
	for _, client := range n.RestConfig.Clients {
		// set the default framework.
		if client.Framework == "" {
			client.Framework = "go-gin-server"
		}
	}
	return nil
}

func GetGoTemplatesRootPath() string {
	return templatesRootPath
}
